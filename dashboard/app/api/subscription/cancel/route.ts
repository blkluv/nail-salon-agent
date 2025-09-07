import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { sendEmail, generateCancellationEmail } from '@/lib/email-service-new'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-08-27.basil',
  })
}

interface CancellationRequest {
  businessId: string
  reason: string
  feedback?: string
  retainNumber: boolean
  wouldReturn?: boolean
  cancellationToken?: string // For email cancellation links
}

export async function POST(request: NextRequest) {
  try {
    const body: CancellationRequest = await request.json()
    
    // Validate business exists
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', body.businessId)
      .single()
      
    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }
    
    // Verify cancellation token if provided (for email links)
    if (body.cancellationToken && business.cancellation_token !== body.cancellationToken) {
      return NextResponse.json(
        { error: 'Invalid cancellation token' },
        { status: 401 }
      )
    }
    
    // Store cancellation survey data
    const { error: surveyError } = await supabase
      .from('cancellation_surveys')
      .insert({
        business_id: body.businessId,
        reason: body.reason,
        detailed_feedback: body.feedback,
        would_return: body.wouldReturn || false,
        created_at: new Date().toISOString()
      })
      
    if (surveyError) {
      console.error('Failed to save cancellation survey:', surveyError)
    }
    
    // Handle phone number retention
    let numberRetentionSubscriptionId = null
    
    if (body.retainNumber && business.phone_number) {
      try {
        const stripe = getStripeClient()
        
        // Create $5/month subscription for number retention
        if (business.stripe_customer_id) {
          const subscription = await stripe.subscriptions.create({
            customer: business.stripe_customer_id,
            items: [{
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Phone Number Retention',
                  description: `Keep your AI phone number ${business.phone_number} active`
                },
                unit_amount: 500, // $5.00
                recurring: {
                  interval: 'month'
                }
              }
            }],
            metadata: {
              business_id: body.businessId,
              type: 'number_retention'
            }
          })
          
          numberRetentionSubscriptionId = subscription.id
          console.log('✅ Number retention subscription created:', subscription.id)
        }
        
        // Update phone lifecycle
        await supabase
          .from('phone_number_lifecycle')
          .insert({
            business_id: body.businessId,
            phone_number: business.phone_number,
            vapi_phone_id: business.vapi_phone_id,
            status: 'retained',
            retained_at: new Date().toISOString(),
            retention_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
          })
          
      } catch (stripeError) {
        console.error('Failed to create retention subscription:', stripeError)
        // Continue with cancellation even if retention fails
      }
    } else if (business.phone_number) {
      // Schedule number for release in 7 days
      const releaseDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      
      await supabase
        .from('phone_number_lifecycle')
        .insert({
          business_id: body.businessId,
          phone_number: business.phone_number,
          vapi_phone_id: business.vapi_phone_id,
          status: 'pending_release',
          retention_end_date: releaseDate.toISOString()
        })
    }
    
    // Update business record
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        subscription_status: body.retainNumber ? 'number_only' : 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: body.reason,
        cancellation_feedback: body.feedback,
        number_retention: body.retainNumber,
        number_release_date: body.retainNumber ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        stripe_number_retention_subscription_id: numberRetentionSubscriptionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.businessId)
      
    if (updateError) {
      console.error('Failed to update business record:', updateError)
      return NextResponse.json(
        { error: 'Failed to process cancellation' },
        { status: 500 }
      )
    }
    
    // Cancel main Stripe subscription if exists
    if (business.stripe_subscription_id) {
      try {
        const stripe = getStripeClient()
        await stripe.subscriptions.cancel(business.stripe_subscription_id)
        console.log('✅ Main subscription cancelled:', business.stripe_subscription_id)
      } catch (stripeError) {
        console.error('Failed to cancel Stripe subscription:', stripeError)
      }
    }
    
    // Send cancellation confirmation email
    try {
      const cancellationEmailHtml = generateCancellationEmail(
        business.name,
        body.retainNumber,
        business.phone_number
      )
      
      await sendEmail({
        to: business.email,
        subject: `Subscription Cancelled - ${business.name}`,
        html: cancellationEmailHtml
      })
      
      console.log('✅ Cancellation email sent to:', business.email)
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError)
    }
    
    // Create win-back campaign entry for future emails
    await supabase
      .from('win_back_campaigns')
      .insert({
        business_id: body.businessId,
        campaign_type: 'day_1',
        created_at: new Date().toISOString()
      })
    
    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      numberRetained: body.retainNumber,
      numberReleaseDate: body.retainNumber ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      dataRetentionDays: 30
    })
    
  } catch (error) {
    console.error('Cancellation error:', error)
    return NextResponse.json(
      { error: 'Failed to process cancellation' },
      { status: 500 }
    )
  }
}

// GET endpoint for email cancellation links
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')
  const businessId = searchParams.get('businessId')
  
  if (!token || !businessId) {
    return NextResponse.json(
      { error: 'Invalid cancellation link' },
      { status: 400 }
    )
  }
  
  // Verify token
  const { data: business, error } = await supabase
    .from('businesses')
    .select('cancellation_token')
    .eq('id', businessId)
    .single()
    
  if (error || !business || business.cancellation_token !== token) {
    return NextResponse.json(
      { error: 'Invalid or expired cancellation link' },
      { status: 401 }
    )
  }
  
  // Return cancellation page URL for redirect
  return NextResponse.json({
    success: true,
    redirectUrl: `/cancel?businessId=${businessId}&token=${token}`
  })
}