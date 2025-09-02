import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Mock campaigns for now - in production this would come from database
    const campaigns = [
      {
        id: '1',
        name: 'Welcome New Customers',
        subject: 'Welcome to Your Salon! 🎉',
        status: 'sent',
        recipient_count: 45,
        open_rate: 68.5,
        click_rate: 12.3,
        created_at: '2024-01-15T10:30:00Z',
        sent_at: '2024-01-16T09:00:00Z',
        template_type: 'welcome'
      },
      {
        id: '2',
        name: 'Holiday Special Offer',
        subject: 'New Year, New Nails! 50% Off First Visit',
        status: 'draft',
        recipient_count: 120,
        created_at: '2024-01-20T14:15:00Z',
        template_type: 'promotion'
      },
      {
        id: '3',
        name: 'January Newsletter',
        subject: 'January Nail Trends & Beauty Tips',
        status: 'scheduled',
        recipient_count: 87,
        created_at: '2024-01-18T16:45:00Z',
        template_type: 'newsletter'
      }
    ]

    return NextResponse.json({
      success: true,
      campaigns
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name, subject, content, recipients, template_type } = await request.json()

    // Validate required fields
    if (!name || !subject || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new campaign (mock for now)
    const newCampaign = {
      id: Date.now().toString(),
      name,
      subject,
      content,
      status: 'draft',
      recipient_count: recipients?.length || 0,
      created_at: new Date().toISOString(),
      template_type: template_type || 'newsletter'
    }

    return NextResponse.json({
      success: true,
      campaign: newCampaign
    })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}