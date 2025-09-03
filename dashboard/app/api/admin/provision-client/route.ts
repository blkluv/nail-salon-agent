import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VAPI_API_KEY = process.env.VAPI_API_KEY!
const WEBHOOK_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://web-production-60875.up.railway.app'

// Shared default assistant for Starter and Professional tiers
const SHARED_ASSISTANT_ID = '8ab7e000-aea8-4141-a471-33133219a471' // Existing nail concierge assistant

interface ProvisionClientRequest {
  businessName: string
  ownerName: string
  ownerEmail: string
  phone: string
  plan: 'starter' | 'professional' | 'business' | 'enterprise'
  address?: string
  services?: string[]
  businessType?: string
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
    
    // Generate unique slug from business name
    const slug = body.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        id: businessId,
        slug: slug,
        name: body.businessName,
        email: body.ownerEmail,
        owner_first_name: body.ownerName?.split(' ')[0] || 'Demo',
        owner_last_name: body.ownerName?.split(' ').slice(1).join(' ') || 'Owner',
        owner_email: body.ownerEmail,
        phone: body.phone,
        address: body.address,
        business_type: body.businessType || 'beauty_salon',
        plan_type: body.plan,
        subscription_status: 'trial',
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

    // Step 2: Provision Vapi Phone Number (New Vapi numbers, not Twilio)
    console.log('📞 Provisioning new Vapi phone number...')
    
    const phoneResponse = await fetch('https://api.vapi.ai/phone-number', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'vapi', // Use Vapi provider instead of Twilio
        name: `${body.businessName} Booking Line`,
        assistantId: null // Will set based on plan tier
      })
    })

    if (!phoneResponse.ok) {
      const phoneError = await phoneResponse.text()
      console.error('❌ Vapi phone provisioning failed:', phoneError)
      
      // Update business subscription status to failed
      await supabase
        .from('businesses')
        .update({ subscription_status: 'cancelled' })
        .eq('id', businessId)
      
      return NextResponse.json(
        { error: 'Failed to provision phone number', details: phoneError },
        { status: 500 }
      )
    }

    const phoneData = await phoneResponse.json()
    console.log('✅ Phone number provisioned:', phoneData.number)

    // Step 3: Determine Assistant Strategy Based on Plan Tier
    let assistantId: string
    let assistantData: any = null

    if (body.plan === 'business' || body.plan === 'enterprise') {
      // Business tier gets CUSTOM AI assistant
      console.log('🤖 Creating CUSTOM Vapi assistant for Business tier...')
      
      const assistantResponse = await fetch('https://api.vapi.ai/assistant', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${body.businessName} Custom AI Concierge`,
          model: {
            provider: 'openai',
            model: 'gpt-4o', // Premium model for business tier
            messages: [
              {
                role: 'system',
                content: `You are the personalized AI concierge for ${body.businessName}, a ${body.businessType || 'beauty business'}.

🏢 About ${body.businessName}:
You represent this specific business with their unique personality and services. Always identify yourself as calling from ${body.businessName}.

💼 Your Role:
1. Help customers book appointments with ${body.businessName}
2. Answer questions about our specific services
3. Provide personalized, professional customer service
4. Collect complete customer information for bookings

🎯 Available Services:
${body.services?.map(s => `- ${s}`).join('\n') || '- Professional beauty services\n- Consultation appointments\n- Specialty treatments'}

📋 For Every Booking, Collect:
- Customer name and phone number  
- Preferred date and time
- Specific service requested
- Any special requests or preferences

🎨 Personality: Professional, warm, and knowledgeable about ${body.businessName}'s specific offerings.

Business ID: ${businessId}
Webhook: ${WEBHOOK_BASE_URL}/webhook/vapi/${businessId}

Always represent ${body.businessName} with excellence!`
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
        console.error('❌ Custom assistant creation failed:', assistantError)
        
        // Update business subscription status to failed
        await supabase
          .from('businesses')
          .update({ subscription_status: 'cancelled' })
          .eq('id', businessId)
        
        return NextResponse.json(
          { error: 'Failed to create custom AI assistant', details: assistantError },
          { status: 500 }
        )
      }

      assistantData = await assistantResponse.json()
      assistantId = assistantData.id
      console.log('✅ CUSTOM Assistant created for Business tier:', assistantId)
      
    } else {
      // Starter and Professional tiers use SHARED assistant
      assistantId = SHARED_ASSISTANT_ID
      console.log('✅ Using SHARED Assistant for Starter/Professional tier:', assistantId)
    }

    // Step 4: Link Assistant to Phone Number
    console.log('🔗 Linking assistant to phone number...')
    
    const linkResponse = await fetch(`https://api.vapi.ai/phone-number/${phoneData.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assistantId: assistantId
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
        vapi_assistant_id: assistantId,
        subscription_status: 'active',
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
        duration_minutes: 60, // Default 1 hour
        price_cents: 5000, // Default $50 in cents
        description: `Professional ${serviceName.toLowerCase()} service`,
        category: 'general',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      await supabase.from('services').insert(services)
      console.log('✅ Default services created')
    }

    // Step 7: Send Welcome Email (implement later)
    // TODO: Send email with login credentials and phone number

    console.log('🎉 Client provisioning completed successfully!')

    return NextResponse.json({
      success: true,
      message: 'Client provisioned successfully with tiered AI agent strategy',
      data: {
        businessId,
        businessName: body.businessName,
        phoneNumber: phoneData.number,
        assistantId: assistantId,
        assistantType: (body.plan === 'business' || body.plan === 'enterprise') ? 'custom' : 'shared',
        plan: body.plan,
        features: {
          customAgent: body.plan === 'business' || body.plan === 'enterprise',
          sharedAgent: body.plan === 'starter' || body.plan === 'professional',
          phoneNumber: true,
          multiTenantWebhook: true
        },
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