import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { EmailService } from '../../../../lib/email-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, businessId, ...data } = body

    // Validate business ID
    if (!businessId) {
      return NextResponse.json({
        success: false,
        error: 'Business ID is required'
      }, { status: 400 })
    }

    // Get business information
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()

    if (businessError || !business) {
      return NextResponse.json({
        success: false,
        error: 'Business not found'
      }, { status: 404 })
    }

    switch (action) {
      case 'send_campaign': {
        const { subject, content, segmentType = 'all_customers', customEmails = [] } = data

        if (!subject || !content) {
          return NextResponse.json({
            success: false,
            error: 'Subject and content are required'
          }, { status: 400 })
        }

        let recipients: string[] = []

        // Get recipients based on segment type
        if (segmentType === 'custom' && customEmails.length > 0) {
          recipients = customEmails
        } else {
          // Query customers based on segment
          let query = supabase
            .from('customers')
            .select('email, first_name, last_name, created_at, loyalty_points')
            .eq('business_id', businessId)
            .not('email', 'is', null)

          switch (segmentType) {
            case 'new_customers':
              // Customers from last 30 days
              const thirtyDaysAgo = new Date()
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
              query = query.gte('created_at', thirtyDaysAgo.toISOString())
              break
            
            case 'loyal_customers':
              // Customers with loyalty points > 100
              query = query.gte('loyalty_points', 100)
              break
            
            case 'inactive_customers':
              // Customers without appointments in last 60 days
              // This would require a more complex query with joins
              break
              
            case 'all_customers':
            default:
              // No additional filters
              break
          }

          const { data: customers, error: customerError } = await query

          if (customerError) {
            return NextResponse.json({
              success: false,
              error: 'Failed to fetch customers: ' + customerError.message
            }, { status: 500 })
          }

          recipients = customers?.map(c => c.email).filter(Boolean) || []
        }

        if (recipients.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'No recipients found for this segment'
          }, { status: 400 })
        }

        // Send the marketing campaign
        const result = await EmailService.sendMarketingCampaign(
          recipients,
          subject,
          content,
          business.name
        )

        // Log the campaign in database
        await supabase.from('marketing_campaigns').insert({
          business_id: businessId,
          subject,
          content,
          segment_type: segmentType,
          recipient_count: recipients.length,
          sent_count: result.summary?.sent || 0,
          failed_count: result.summary?.failed || 0,
          status: result.success ? 'sent' : 'failed',
          sent_at: new Date().toISOString()
        })

        return NextResponse.json({
          success: result.success,
          summary: result.summary,
          message: `Campaign sent to ${result.summary?.sent || 0} recipients`
        })
      }

      case 'get_segments': {
        // Get customer segments with counts
        const { data: allCustomers } = await supabase
          .from('customers')
          .select('email, created_at, loyalty_points')
          .eq('business_id', businessId)
          .not('email', 'is', null)

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const segments = {
          all_customers: allCustomers?.length || 0,
          new_customers: allCustomers?.filter(c => 
            new Date(c.created_at) >= thirtyDaysAgo
          ).length || 0,
          loyal_customers: allCustomers?.filter(c => 
            (c.loyalty_points || 0) >= 100
          ).length || 0,
          inactive_customers: 0 // TODO: Calculate inactive customers
        }

        return NextResponse.json({
          success: true,
          segments
        })
      }

      case 'get_campaigns': {
        // Get campaign history
        const { data: campaigns, error: campaignError } = await supabase
          .from('marketing_campaigns')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (campaignError) {
          return NextResponse.json({
            success: false,
            error: 'Failed to fetch campaigns: ' + campaignError.message
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          campaigns: campaigns || []
        })
      }

      case 'preview_campaign': {
        const { subject, content } = data
        
        if (!subject || !content) {
          return NextResponse.json({
            success: false,
            error: 'Subject and content are required'
          }, { status: 400 })
        }

        // Return preview HTML
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>${subject}</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">${business.name}</h1>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                  ${content}
                </div>
                
                <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
                  <p>
                    <a href="#" style="color: #667eea; text-decoration: none;">Unsubscribe</a> |
                    <a href="#" style="color: #667eea; text-decoration: none;">Update Preferences</a>
                  </p>
                  <p style="margin-top: 15px;">${business.name}</p>
                </div>
              </div>
            </body>
          </html>
        `

        return NextResponse.json({
          success: true,
          preview: html
        })
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error: any) {
    console.error('❌ Marketing campaign error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const businessId = url.searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({
        success: false,
        error: 'Business ID is required'
      }, { status: 400 })
    }

    // Get recent campaigns
    const { data: campaigns, error } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch campaigns: ' + error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns || []
    })

  } catch (error: any) {
    console.error('❌ Marketing campaigns GET error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}