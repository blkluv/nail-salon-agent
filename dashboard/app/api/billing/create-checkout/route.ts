import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil'
    })

    const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')
    const { businessId, targetPlan, currentPlan } = await request.json()
    
    console.log('🛒 Creating checkout session:', { businessId, targetPlan, currentPlan, isTestMode })
    
    // Validate business exists
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()
    
    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    
    // Get plan pricing
    const planPrices = {
      starter: 0,
      professional: 97,
      business: 197,
      enterprise: 397
    }
    
    const price = planPrices[targetPlan as keyof typeof planPrices]
    if (!price) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `DropFly ${targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)} Plan`,
              description: getPlanDescription(targetPlan),
              images: ['https://vapi-nail-salon-agent.vercel.app/logo.png'] // Add your logo URL
            },
            recurring: {
              interval: 'month'
            },
            unit_amount: price * 100 // Stripe uses cents
          },
          quantity: 1
        }
      ],
      metadata: {
        businessId,
        targetPlan,
        currentPlan,
        testMode: isTestMode.toString()
      },
      customer_email: business.email || business.owner_email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://vapi-nail-salon-agent.vercel.app'}/dashboard/billing?success=true&plan=${targetPlan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://vapi-nail-salon-agent.vercel.app'}/dashboard/billing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      automatic_tax: {
        enabled: false // Set to true when you're ready for tax collection
      }
    })
    
    console.log('✅ Checkout session created:', session.id)
    
    return NextResponse.json({ 
      sessionId: session.id,
      testMode: isTestMode,
      checkoutUrl: session.url
    })
    
  } catch (error) {
    console.error('❌ Checkout creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

function getPlanDescription(plan: string): string {
  const descriptions = {
    professional: 'Advanced features including payment processing and loyalty programs',
    business: 'Complete multi-location solution with advanced analytics',
    enterprise: 'Custom enterprise solution with dedicated support'
  }
  return descriptions[plan as keyof typeof descriptions] || 'Premium features for your business'
}