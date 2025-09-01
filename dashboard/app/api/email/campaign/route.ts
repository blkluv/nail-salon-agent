import { NextRequest, NextResponse } from 'next/server'
import { EmailMarketingService, EmailCampaign } from '../../../../lib/email-marketing'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Create a new email campaign
export async function POST(request: NextRequest) {
  try {
    const {
      businessId,
      name,
      subject,
      content,
      template_type,
      target_segment,
      scheduled_at
    } = await request.json()

    console.log('📧 Creating email campaign:', { businessId, name, target_segment })

    // Validate required fields
    if (!businessId || !name || !subject || !content || !target_segment) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: businessId, name, subject, content, target_segment'
      }, { status: 400 })
    }

    // Validate target segment
    const validSegments = ['all', 'new_customers', 'returning_customers', 'loyal_customers', 'inactive_customers']
    if (!validSegments.includes(target_segment)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid target segment. Must be one of: ' + validSegments.join(', ')
      }, { status: 400 })
    }

    // Validate business exists
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('id', businessId)
      .single()

    if (businessError || !business) {
      return NextResponse.json({
        success: false,
        error: 'Business not found'
      }, { status: 404 })
    }

    // Create campaign
    const campaign = await EmailMarketingService.createCampaign(businessId, {
      name,
      subject,
      content,
      template_type,
      target_segment,
      scheduled_at
    })

    if (!campaign) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create campaign'
      }, { status: 500 })
    }

    console.log('✅ Campaign created successfully:', campaign.id)

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Campaign created successfully'
    })

  } catch (error: any) {
    console.error('❌ Campaign creation error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Campaign creation failed'
    }, { status: 500 })
  }
}

// GET - List campaigns for a business
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const businessId = url.searchParams.get('businessId')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const status = url.searchParams.get('status')

    if (!businessId) {
      return NextResponse.json({
        success: false,
        error: 'businessId parameter is required'
      }, { status: 400 })
    }

    console.log('📧 Fetching campaigns for business:', businessId)

    // Build query
    let query = supabase
      .from('email_campaigns')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: campaigns, error } = await query

    if (error) {
      console.error('❌ Error fetching campaigns:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch campaigns'
      }, { status: 500 })
    }

    // Get customer segments for reference
    const segments = await EmailMarketingService.getCustomerSegments(businessId)

    console.log(`✅ Found ${campaigns?.length || 0} campaigns`)

    return NextResponse.json({
      success: true,
      campaigns: campaigns || [],
      segments,
      total: campaigns?.length || 0
    })

  } catch (error: any) {
    console.error('❌ Error fetching campaigns:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch campaigns'
    }, { status: 500 })
  }
}

// PUT - Update a campaign
export async function PUT(request: NextRequest) {
  try {
    const {
      campaignId,
      name,
      subject,
      content,
      template_type,
      target_segment,
      scheduled_at,
      status
    } = await request.json()

    if (!campaignId) {
      return NextResponse.json({
        success: false,
        error: 'campaignId is required'
      }, { status: 400 })
    }

    console.log('📧 Updating campaign:', campaignId)

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name
    if (subject !== undefined) updateData.subject = subject
    if (content !== undefined) updateData.content = content
    if (template_type !== undefined) updateData.template_type = template_type
    if (target_segment !== undefined) updateData.target_segment = target_segment
    if (scheduled_at !== undefined) updateData.scheduled_at = scheduled_at
    if (status !== undefined) updateData.status = status

    // Update campaign
    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating campaign:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update campaign'
      }, { status: 500 })
    }

    console.log('✅ Campaign updated successfully:', campaignId)

    return NextResponse.json({
      success: true,
      campaign,
      message: 'Campaign updated successfully'
    })

  } catch (error: any) {
    console.error('❌ Campaign update error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Campaign update failed'
    }, { status: 500 })
  }
}

// DELETE - Delete a campaign
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const campaignId = url.searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json({
        success: false,
        error: 'campaignId parameter is required'
      }, { status: 400 })
    }

    console.log('🗑️ Deleting campaign:', campaignId)

    // Check if campaign exists and get its status
    const { data: campaign, error: fetchError } = await supabase
      .from('email_campaigns')
      .select('status')
      .eq('id', campaignId)
      .single()

    if (fetchError || !campaign) {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 })
    }

    // Don't allow deletion of campaigns that are currently sending
    if (campaign.status === 'sending') {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete campaign that is currently sending'
      }, { status: 400 })
    }

    // Delete campaign (this will also delete related email_logs due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('email_campaigns')
      .delete()
      .eq('id', campaignId)

    if (deleteError) {
      console.error('❌ Error deleting campaign:', deleteError)
      return NextResponse.json({
        success: false,
        error: 'Failed to delete campaign'
      }, { status: 500 })
    }

    console.log('✅ Campaign deleted successfully:', campaignId)

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })

  } catch (error: any) {
    console.error('❌ Campaign deletion error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Campaign deletion failed'
    }, { status: 500 })
  }
}