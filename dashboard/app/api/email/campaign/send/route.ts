import { NextRequest, NextResponse } from 'next/server'
import { EmailMarketingService } from '../../../../../lib/email-marketing'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { campaignId } = await request.json()

    if (!campaignId) {
      return NextResponse.json({
        success: false,
        error: 'campaignId is required'
      }, { status: 400 })
    }

    console.log('🚀 Sending campaign:', campaignId)

    // Verify campaign exists and can be sent
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 })
    }

    // Check if campaign is in a sendable state
    if (campaign.status === 'sending') {
      return NextResponse.json({
        success: false,
        error: 'Campaign is already being sent'
      }, { status: 400 })
    }

    if (campaign.status === 'sent') {
      return NextResponse.json({
        success: false,
        error: 'Campaign has already been sent'
      }, { status: 400 })
    }

    // Send the campaign
    const result = await EmailMarketingService.sendCampaign(campaignId)

    if (result.success) {
      console.log('✅ Campaign sent successfully:', {
        campaignId,
        sent: result.sent,
        failed: result.failed
      })

      return NextResponse.json({
        success: true,
        campaignId,
        sent: result.sent,
        failed: result.failed,
        errors: result.errors,
        message: `Campaign sent successfully. ${result.sent} emails sent, ${result.failed} failed.`
      })
    } else {
      console.error('❌ Campaign send failed:', result.errors)

      return NextResponse.json({
        success: false,
        error: 'Campaign sending failed',
        errors: result.errors
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ Campaign send error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Campaign sending failed'
    }, { status: 500 })
  }
}

// GET endpoint to check campaign send status
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const campaignId = url.searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json({
        success: false,
        error: 'campaignId parameter is required'
      }, { status: 400 })
    }

    // Get campaign details
    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (error || !campaign) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 })
    }

    // Get email logs for this campaign to calculate metrics
    const { data: emailLogs, error: logsError } = await supabase
      .from('email_logs')
      .select('status, sent_at, opened_at, clicked_at')
      .eq('campaign_id', campaignId)

    let metrics = {
      total_sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      open_rate: 0,
      click_rate: 0,
      bounce_rate: 0
    }

    if (emailLogs) {
      metrics.total_sent = emailLogs.length
      metrics.delivered = emailLogs.filter(log => log.status === 'delivered').length
      metrics.opened = emailLogs.filter(log => log.opened_at).length
      metrics.clicked = emailLogs.filter(log => log.clicked_at).length
      metrics.bounced = emailLogs.filter(log => log.status === 'bounced').length

      // Calculate rates
      if (metrics.delivered > 0) {
        metrics.open_rate = Math.round((metrics.opened / metrics.delivered) * 10000) / 100
        metrics.click_rate = Math.round((metrics.clicked / metrics.delivered) * 10000) / 100
      }
      if (metrics.total_sent > 0) {
        metrics.bounce_rate = Math.round((metrics.bounced / metrics.total_sent) * 10000) / 100
      }
    }

    return NextResponse.json({
      success: true,
      campaign: {
        ...campaign,
        metrics
      },
      canSend: ['draft', 'scheduled'].includes(campaign.status),
      sendingStatus: {
        draft: 'Ready to send',
        scheduled: 'Scheduled for sending',
        sending: 'Currently sending...',
        sent: 'Campaign completed',
        cancelled: 'Campaign cancelled'
      }[campaign.status] || 'Unknown status'
    })

  } catch (error: any) {
    console.error('❌ Error getting campaign status:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get campaign status'
    }, { status: 500 })
  }
}