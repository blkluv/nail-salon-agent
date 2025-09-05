import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
// import { 
//   ACTIVATION_CAMPAIGNS, 
//   buildActivationEmail,
//   buildDashboardNotification,
//   getActiveCampaigns 
// } from '@/lib/post-billing-campaigns'
// import { featureTracker } from '@/lib/feature-usage-tracker'

// This would run as a cron job daily
export async function POST(request: NextRequest) {
  try {
    // Temporarily simplified for build testing
    return NextResponse.json({
      success: true,
      message: 'Post-billing campaigns endpoint - implementation pending'
    })
    
    /*
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )

    // Get all active businesses that have completed billing
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('subscription_status', 'active')
      .not('billing_start_date', 'is', null)

    if (error || !businesses) {
      console.error('Error fetching businesses:', error)
      return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
    }
    */

    /*
    const results = {
      processed: 0,
      emailsSent: 0,
      notificationsCreated: 0,
      interventionsTriggered: 0,
      errors: [] as string[]
    }

    for (const business of businesses) {
      try {
        // Skip if no billing start date
        if (!business.billing_start_date) continue

        const billingStartDate = new Date(business.billing_start_date)
        const daysSinceBilling = Math.floor(
          (Date.now() - billingStartDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Get usage metrics for targeted campaigns
        const metrics = await featureTracker.getUsageMetrics(business.id)

        // Find applicable campaigns for this business
        const campaigns = ACTIVATION_CAMPAIGNS.filter(campaign => 
          campaign.tier === business.plan_tier && 
          campaign.day === daysSinceBilling
        )

        // Process each campaign
        for (const campaign of campaigns) {
          // Build and send email
          const email = buildActivationEmail(campaign, business.name)
          
          // Store email in database for tracking
          await supabase
            .from('email_campaigns')
            .insert({
              business_id: business.id,
              campaign_id: campaign.id,
              subject: email.subject,
              body: email.body,
              sent_at: new Date().toISOString(),
              status: 'sent'
            })

          results.emailsSent++

          // Create dashboard notification
          const notification = buildDashboardNotification(campaign)
          
          await supabase
            .from('dashboard_notifications')
            .insert({
              business_id: business.id,
              type: notification.type,
              priority: notification.priority,
              title: notification.title,
              message: notification.message,
              cta_text: notification.cta?.text,
              cta_action: notification.cta?.action,
              dismissible: notification.dismissible,
              created_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            })

          results.notificationsCreated++
        }

        // Check for intervention needs
        if (metrics.riskLevel === 'high' || 
            (metrics.unusedCriticalFeatures.length > 0 && daysSinceBilling > 7)) {
          
          // Generate intervention strategy
          const intervention = await featureTracker.generateInterventionStrategy(business.id)
          
          // Create high-priority intervention notification
          await supabase
            .from('dashboard_notifications')
            .insert({
              business_id: business.id,
              type: 'warning',
              priority: 'high',
              title: '⚠️ Action Required: Maximize Your Investment',
              message: intervention.messages[0] || 'You\'re not getting full value from your subscription.',
              cta_text: 'Get Help Now',
              cta_action: 'request-support',
              dismissible: false,
              created_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })

          // Log intervention for support team
          await supabase
            .from('support_interventions')
            .insert({
              business_id: business.id,
              risk_level: metrics.riskLevel,
              intervention_type: intervention.interventionType,
              unused_features: metrics.unusedCriticalFeatures,
              engagement_score: metrics.totalScore,
              created_at: new Date().toISOString(),
              status: 'pending'
            })

          results.interventionsTriggered++
        }

        // Special handling for specific milestones
        if (daysSinceBilling === 7) {
          // Week 1 check-in
          await trackMilestone(supabase, business.id, 'week_1_checkin', metrics)
        } else if (daysSinceBilling === 14) {
          // Two week critical point
          await trackMilestone(supabase, business.id, 'week_2_critical', metrics)
        } else if (daysSinceBilling === 30) {
          // First month complete
          await trackMilestone(supabase, business.id, 'month_1_complete', metrics)
        }

        results.processed++
      } catch (businessError) {
        console.error(`Error processing business ${business.id}:`, businessError)
        results.errors.push(`Business ${business.id}: ${(businessError as Error).message}`)
      }
    }

    // Identify and process at-risk customers
    const atRiskCustomers = await featureTracker.identifyAtRiskCustomers()
    
    for (const customerId of atRiskCustomers) {
      try {
        // Create retention campaign
        await createRetentionCampaign(supabase, customerId)
      } catch (error) {
        console.error(`Error creating retention campaign for ${customerId}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      atRiskCustomersIdentified: atRiskCustomers.length
    })
    */

  } catch (error) {
    console.error('Campaign processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process campaigns', details: (error as Error).message },
      { status: 500 }
    )
  }
}

/*
// Track milestone achievements
async function trackMilestone(
  supabase: any, 
  businessId: string, 
  milestone: string, 
  metrics: any
) {
  const milestoneMessages = {
    week_1_checkin: {
      healthy: '🎉 Great job! You\'re on track for success.',
      at_risk: '⚠️ Let\'s make sure you\'re getting full value from your investment.'
    },
    week_2_critical: {
      healthy: '💪 Two weeks in and crushing it! Keep going.',
      at_risk: '🚨 Day 14 is critical - most cancellations happen now. Let\'s prevent that.'
    },
    month_1_complete: {
      healthy: '🏆 First month complete! Here\'s your success report.',
      at_risk: '📊 First month review - let\'s optimize for month 2.'
    }
  }

  const isHealthy = metrics.riskLevel === 'healthy' || metrics.riskLevel === 'low'
  const messages = milestoneMessages[milestone as keyof typeof milestoneMessages]
  const message = isHealthy ? messages.healthy : messages.at_risk

  await supabase
    .from('business_milestones')
    .insert({
      business_id: businessId,
      milestone,
      achieved_at: new Date().toISOString(),
      engagement_score: metrics.totalScore,
      risk_level: metrics.riskLevel,
      message
    })

  // Create milestone notification
  await supabase
    .from('dashboard_notifications')
    .insert({
      business_id: businessId,
      type: isHealthy ? 'success' : 'warning',
      priority: milestone === 'week_2_critical' && !isHealthy ? 'high' : 'medium',
      title: message,
      message: `Your engagement score: ${metrics.totalScore}. ${
        isHealthy 
          ? 'You\'re using features effectively!' 
          : `Unused features: ${metrics.unusedCriticalFeatures.join(', ')}`
      }`,
      cta_text: isHealthy ? 'View Success Report' : 'Get Support',
      cta_action: isHealthy ? 'view-report' : 'request-help',
      dismissible: true,
      created_at: new Date().toISOString()
    })
}

// Create targeted retention campaign for at-risk customer
async function createRetentionCampaign(supabase: any, customerId: string) {
  const metrics = await featureTracker.getUsageMetrics(customerId)
  const intervention = await featureTracker.generateInterventionStrategy(customerId)

  // Create urgent retention email
  const retentionEmail = {
    subject: '🚨 Your account needs attention',
    body: `
      <h2>We noticed you haven't been getting full value from your subscription</h2>
      <p>${intervention.messages.join(' ')}</p>
      <h3>Here's what we can do to help:</h3>
      <ul>
        ${intervention.incentives.map(i => `<li>${i}</li>`).join('')}
      </ul>
      <p><strong>Reply to this email or call us immediately for assistance.</strong></p>
    `
  }

  await supabase
    .from('email_campaigns')
    .insert({
      business_id: customerId,
      campaign_id: 'retention_emergency',
      subject: retentionEmail.subject,
      body: retentionEmail.body,
      sent_at: new Date().toISOString(),
      status: 'sent',
      priority: 'urgent'
    })

  // Create support ticket
  await supabase
    .from('support_tickets')
    .insert({
      business_id: customerId,
      type: 'retention_risk',
      priority: intervention.escalation,
      subject: 'At-risk customer requires immediate attention',
      description: JSON.stringify({
        riskLevel: metrics.riskLevel,
        unusedFeatures: metrics.unusedCriticalFeatures,
        daysSinceEngagement: Math.floor(
          (Date.now() - metrics.lastEngagement.getTime()) / (1000 * 60 * 60 * 24)
        ),
        recommendedActions: metrics.recommendedActions
      }),
      status: 'open',
      created_at: new Date().toISOString()
    })
}

// GET endpoint to check campaign status
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Campaign status endpoint - implementation pending'
    })
  } catch (error) {
    console.error('Error fetching campaign status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign status' },
      { status: 500 }
    )
  }
}
*/