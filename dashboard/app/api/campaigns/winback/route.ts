import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, generateWinBackEmail } from '../../../../lib/email-service-new'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting win-back email campaign check...')
    
    // Get businesses that cancelled exactly 7 days ago and haven't had a day_7 campaign
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)
    
    const eightDaysAgo = new Date(sevenDaysAgo)
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 1)
    eightDaysAgo.setHours(23, 59, 59, 999)
    
    // Query businesses that cancelled 7 days ago
    const { data: cancelledBusinesses, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('subscription_status', 'cancelled')
      .gte('cancelled_at', eightDaysAgo.toISOString())
      .lte('cancelled_at', sevenDaysAgo.toISOString())
    
    if (businessError) {
      console.error('❌ Error fetching cancelled businesses:', businessError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    if (!cancelledBusinesses || cancelledBusinesses.length === 0) {
      console.log('✅ No businesses cancelled 7 days ago')
      return NextResponse.json({ 
        success: true, 
        message: 'No eligible businesses for day 7 campaign',
        businessesProcessed: 0
      })
    }
    
    console.log(`📧 Found ${cancelledBusinesses.length} businesses for day 7 win-back`)
    
    let emailsSent = 0
    let errors = 0
    
    for (const business of cancelledBusinesses) {
      try {
        // Check if we already sent a day_7 campaign to this business
        const { data: existingCampaign, error: campaignCheckError } = await supabase
          .from('win_back_campaigns')
          .select('id')
          .eq('business_id', business.id)
          .eq('campaign_type', 'day_7')
          .single()
        
        if (existingCampaign) {
          console.log(`⏭️ Already sent day_7 campaign to ${business.name}`)
          continue
        }
        
        // Generate reactivation token if doesn't exist
        let reactivationToken = business.reactivation_token
        if (!reactivationToken) {
          reactivationToken = crypto.randomUUID()
          await supabase
            .from('businesses')
            .update({ reactivation_token: reactivationToken })
            .eq('id', business.id)
        }
        
        // Generate and send win-back email
        const winBackEmailHtml = generateWinBackEmail(
          business.name,
          business.cancellation_reason || 'other',
          7,
          reactivationToken,
          business.id
        )
        
        const emailResult = await sendEmail({
          to: business.email,
          subject: `${business.name}, we miss you! 💔 (50% off inside)`,
          html: winBackEmailHtml
        })
        
        if (emailResult.success) {
          // Record the campaign in the database
          const { error: campaignError } = await supabase
            .from('win_back_campaigns')
            .insert({
              business_id: business.id,
              campaign_type: 'day_7',
              sent_at: new Date().toISOString(),
              offer_code: '50OFF',
              offer_discount_percent: 50
            })
          
          if (campaignError) {
            console.error(`⚠️ Failed to record campaign for ${business.name}:`, campaignError)
          }
          
          emailsSent++
          console.log(`✅ Win-back email sent to ${business.name} (${business.email})`)
        } else {
          console.error(`❌ Failed to send email to ${business.name}:`, emailResult.error)
          errors++
        }
        
        // Small delay to avoid overwhelming email service
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (businessError) {
        console.error(`❌ Error processing business ${business.name}:`, businessError)
        errors++
      }
    }
    
    console.log(`🎯 Win-back campaign completed: ${emailsSent} sent, ${errors} errors`)
    
    return NextResponse.json({
      success: true,
      message: 'Win-back campaign completed',
      businessesProcessed: cancelledBusinesses.length,
      emailsSent,
      errors,
      campaignType: 'day_7'
    })
    
  } catch (error) {
    console.error('❌ Win-back campaign failed:', error)
    return NextResponse.json(
      { error: 'Campaign failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint for manual testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Win-back campaign endpoint',
    usage: 'POST to trigger campaign check',
    timestamp: new Date().toISOString()
  })
}

// Optional: Add authentication for production
function isValidCronRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  // If no secret set, allow all requests (development)
  if (!cronSecret) return true
  
  // Check for valid authorization
  return authHeader === `Bearer ${cronSecret}`
}

// Add authentication check if needed
export async function authenticatedPOST(request: NextRequest) {
  if (!isValidCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  return POST(request)
}