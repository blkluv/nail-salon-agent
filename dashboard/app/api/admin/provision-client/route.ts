import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VAPI_API_KEY = process.env.VAPI_API_KEY!
const WEBHOOK_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://web-production-60875.up.railway.app'

interface ProvisionClientRequest {
  businessName: string
  ownerName: string
  ownerEmail: string
  phone: string
  plan: 'starter' | 'professional' | 'business' | 'enterprise'
  address?: string
  services?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: ProvisionClientRequest = await request.json()
    
    // Validate required fields
    if (!body.businessName || !body.ownerEmail || !body.plan) {
      return NextResponse.json(
        { error: 'Missing required fields: businessName, ownerEmail, plan' },
        { status: 400 }
      )
    }

    console.log('🚀 Starting automated client provisioning for:', body.businessName)

    // Step 1: Create business record in database
    const businessId = crypto.randomUUID()
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        id: businessId,
        name: body.businessName,
        owner_name: body.ownerName,
        owner_email: body.ownerEmail,
        phone: body.phone,
        address: body.address,
        plan_tier: body.plan,
        status: 'provisioning',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (businessError) {
      console.error('❌ Database error:', businessError)
      return NextResponse.json(
        { error: 'Failed to create business record', details: businessError.message },
        { status: 500 }
      )
    }

    console.log('✅ Business record created:', businessId)

    // Step 2: Provision Vapi Phone Number
    console.log('📞 Provisioning Vapi phone number...')
    
    const phoneResponse = await fetch('https://api.vapi.ai/phone-number', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'twilio',
        name: `${body.businessName} Booking Line`,
        assistantId: null // Will set after creating assistant
      })
    })

    if (!phoneResponse.ok) {
      const phoneError = await phoneResponse.text()
      console.error('❌ Vapi phone provisioning failed:', phoneError)
      
      // Update business status to failed
      await supabase
        .from('businesses')
        .update({ status: 'failed', error_message: 'Phone provisioning failed' })
        .eq('id', businessId)
      
      return NextResponse.json(
        { error: 'Failed to provision phone number', details: phoneError },
        { status: 500 }
      )
    }

    const phoneData = await phoneResponse.json()
    console.log('✅ Phone number provisioned:', phoneData.number)

    // Step 3: Create Vapi Assistant
    console.log('🤖 Creating Vapi assistant...')
    
    const assistantResponse = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `${body.businessName} AI Booking Assistant`,
        model: {
          provider: 'openai',
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a helpful AI assistant for ${body.businessName}, a nail salon. 
              
Your job is to:
1. Help customers book appointments
2. Answer questions about services
3. Provide friendly, professional customer service
4. Collect customer information for bookings

Available services: ${body.services?.join(', ') || 'Basic Manicure, Gel Manicure, Pedicure, Nail Art'}

Always be warm, professional, and helpful. When booking appointments, collect:
- Customer name and phone number
- Preferred date and time
- Service requested
- Any special requests

Business ID: ${businessId}
Webhook: ${WEBHOOK_BASE_URL}/webhook/vapi/${businessId}`
            }
          ]
        },
        voice: {
          provider: '11labs',
          voiceId: 'sarah'
        },
        serverUrl: `${WEBHOOK_BASE_URL}/webhook/vapi/${businessId}`,
        serverUrlSecret: businessId
      })
    })

    if (!assistantResponse.ok) {
      const assistantError = await assistantResponse.text()
      console.error('❌ Vapi assistant creation failed:', assistantError)
      
      // Update business status to failed
      await supabase
        .from('businesses')
        .update({ status: 'failed', error_message: 'Assistant creation failed' })
        .eq('id', businessId)
      
      return NextResponse.json(
        { error: 'Failed to create AI assistant', details: assistantError },
        { status: 500 }
      )
    }

    const assistantData = await assistantResponse.json()
    console.log('✅ Assistant created:', assistantData.id)

    // Step 4: Link Assistant to Phone Number
    console.log('🔗 Linking assistant to phone number...')
    
    const linkResponse = await fetch(`https://api.vapi.ai/phone-number/${phoneData.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assistantId: assistantData.id
      })
    })

    if (!linkResponse.ok) {
      const linkError = await linkResponse.text()
      console.error('❌ Failed to link assistant to phone:', linkError)
    } else {
      console.log('✅ Assistant linked to phone number')
    }

    // Step 5: Update Business Record with Vapi Details
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        vapi_phone_number: phoneData.number,
        vapi_phone_id: phoneData.id,
        vapi_assistant_id: assistantData.id,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', businessId)

    if (updateError) {
      console.error('❌ Failed to update business record:', updateError)
      return NextResponse.json(
        { error: 'Failed to update business record', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Business record updated with Vapi details')

    // Step 6: Create Default Services
    if (body.services && body.services.length > 0) {
      const services = body.services.map(serviceName => ({
        id: crypto.randomUUID(),
        business_id: businessId,
        name: serviceName,
        duration: 60, // Default 1 hour
        price: 50, // Default $50
        description: `Professional ${serviceName.toLowerCase()} service`,
        is_active: true,
        created_at: new Date().toISOString()
      }))

      await supabase.from('services').insert(services)
      console.log('✅ Default services created')
    }

    // Step 7: Send Welcome Email (implement later)
    // TODO: Send email with login credentials and phone number

    console.log('🎉 Client provisioning completed successfully!')

    return NextResponse.json({
      success: true,
      message: 'Client provisioned successfully',
      data: {
        businessId,
        businessName: body.businessName,
        phoneNumber: phoneData.number,
        assistantId: assistantData.id,
        dashboardUrl: `${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/login?business=${businessId}`,
        status: 'active'
      }
    })

  } catch (error) {
    console.error('❌ Unexpected error during client provisioning:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error during provisioning', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    service: 'Client Provisioning API',
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
}