import { NextRequest, NextResponse } from 'next/server'
import { TwilioService } from '../../../../lib/twilio-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Parse Twilio webhook data (form-encoded)
    const formData = await request.formData()
    const from = formData.get('From') as string
    const body = formData.get('Body') as string
    const messageSid = formData.get('MessageSid') as string
    const accountSid = formData.get('AccountSid') as string

    console.log('📱 Incoming SMS webhook:', { from, body: body?.substring(0, 50), messageSid })

    if (!from || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify this is from our Twilio account
    if (accountSid !== process.env.TWILIO_ACCOUNT_SID) {
      console.error('❌ Invalid Twilio account SID')
      return NextResponse.json({ error: 'Invalid account' }, { status: 403 })
    }

    // Handle the incoming SMS
    const result = await TwilioService.handleIncomingSMS(from, body)
    
    // Find customer by phone number
    const { data: customer } = await supabase
      .from('customers')
      .select('*, businesses(name)')
      .eq('phone', from.replace('+1', ''))
      .single()

    // Log the incoming message
    await supabase
      .from('sms_logs')
      .insert({
        business_id: customer?.business_id,
        customer_id: customer?.id,
        recipient_phone: process.env.TWILIO_PHONE_NUMBER, // Our business number
        sender_phone: from,
        message_type: 'incoming',
        message_content: body,
        twilio_message_id: messageSid,
        status: 'received',
        action_taken: result.action,
        sent_at: new Date().toISOString()
      })

    // If we should send an auto-response
    if (result.success && result.response) {
      console.log('🤖 Sending auto-response:', result.response)
      
      // Send the response
      const responseResult = await TwilioService.sendSMS(from, result.response)
      
      if (responseResult.success) {
        // Log the outgoing response
        await supabase
          .from('sms_logs')
          .insert({
            business_id: customer?.business_id,
            customer_id: customer?.id,
            recipient_phone: from,
            message_type: 'auto_response',
            message_content: result.response,
            twilio_message_id: responseResult.messageId,
            status: 'sent',
            sent_at: new Date().toISOString()
          })
      }
    }

    // Handle specific actions
    await handleSMSAction(result.action, from, body, customer)

    // Return TwiML response (Twilio expects XML)
    const twimlResponse = result.response 
      ? `<?xml version="1.0" encoding="UTF-8"?>
         <Response>
           <Message>${escapeXml(result.response)}</Message>
         </Response>`
      : `<?xml version="1.0" encoding="UTF-8"?>
         <Response></Response>`

    return new NextResponse(twimlResponse, {
      headers: { 'Content-Type': 'text/xml' }
    })

  } catch (error: any) {
    console.error('❌ SMS webhook error:', error)
    
    // Return empty TwiML response on error
    const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
                          <Response></Response>`
    
    return new NextResponse(errorResponse, {
      headers: { 'Content-Type': 'text/xml' }
    })
  }
}

async function handleSMSAction(
  action: string | undefined, 
  from: string, 
  body: string, 
  customer: any
): Promise<void> {
  try {
    if (!action || !customer) return

    switch (action) {
      case 'cancel_request':
        // Find customer's upcoming appointments
        const { data: upcomingAppointments } = await supabase
          .from('appointments')
          .select('*')
          .eq('customer_id', customer.id)
          .gte('appointment_date', new Date().toISOString().split('T')[0])
          .in('status', ['pending', 'confirmed'])
          .limit(3)

        if (upcomingAppointments && upcomingAppointments.length > 0) {
          // Create a cancellation request record for staff to review
          await supabase
            .from('cancellation_requests')
            .insert({
              business_id: customer.business_id,
              customer_id: customer.id,
              appointment_id: upcomingAppointments[0].id,
              request_method: 'sms',
              request_message: body,
              status: 'pending',
              created_at: new Date().toISOString()
            })

          console.log('📝 Cancellation request logged for staff review')
        }
        break

      case 'reschedule_request':
        // Find customer's upcoming appointments
        const { data: appointments } = await supabase
          .from('appointments')
          .select('*')
          .eq('customer_id', customer.id)
          .gte('appointment_date', new Date().toISOString().split('T')[0])
          .in('status', ['pending', 'confirmed'])
          .limit(3)

        if (appointments && appointments.length > 0) {
          // Create a reschedule request record
          await supabase
            .from('reschedule_requests')
            .insert({
              business_id: customer.business_id,
              customer_id: customer.id,
              appointment_id: appointments[0].id,
              request_method: 'sms',
              request_message: body,
              status: 'pending',
              created_at: new Date().toISOString()
            })

          console.log('📝 Reschedule request logged for staff review')
        }
        break

      case 'unsubscribe':
        // Update customer preferences to opt out of promotional messages
        await supabase
          .from('customers')
          .update({
            preferences: {
              ...customer.preferences,
              sms_promotional: false,
              unsubscribed_at: new Date().toISOString()
            }
          })
          .eq('id', customer.id)

        console.log('🚫 Customer unsubscribed from promotional SMS')
        break

      case 'general_inquiry':
        // Create a support ticket or inquiry record
        await supabase
          .from('customer_inquiries')
          .insert({
            business_id: customer.business_id,
            customer_id: customer.id,
            inquiry_method: 'sms',
            inquiry_message: body,
            status: 'new',
            priority: 'normal',
            created_at: new Date().toISOString()
          })

        console.log('❓ Customer inquiry logged for staff review')
        break

      default:
        console.log('ℹ️ No specific action taken for:', action)
    }

  } catch (error) {
    console.error('❌ Error handling SMS action:', error)
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// GET endpoint for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'SMS webhook endpoint is active',
    timestamp: new Date().toISOString(),
    webhook_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'}/api/webhook/sms`,
    setup_instructions: {
      '1': 'Configure this URL in your Twilio Console',
      '2': 'Set HTTP method to POST',
      '3': 'Ensure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are configured',
      '4': 'Test by sending an SMS to your Twilio number'
    }
  })
}