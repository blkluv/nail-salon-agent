import { NextRequest, NextResponse } from 'next/server'
import { TwilioService } from '../../../lib/twilio-service'
import { SMSTemplates, SMSTemplateData } from '../../../lib/sms-templates'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface SendSMSRequest {
  phone: string
  message?: string
  template?: string
  templateData?: SMSTemplateData
  businessId?: string
  customerId?: string
  appointmentId?: string
}

export async function POST(request: NextRequest) {
  try {
    const {
      phone,
      message,
      template,
      templateData = {},
      businessId,
      customerId,
      appointmentId
    }: SendSMSRequest = await request.json()

    console.log('📱 SMS request:', { phone, template, hasMessage: !!message, businessId })

    // Validate required fields
    if (!phone) {
      return NextResponse.json({
        success: false,
        error: 'Phone number is required'
      }, { status: 400 })
    }

    if (!message && !template) {
      return NextResponse.json({
        success: false,
        error: 'Either message or template is required'
      }, { status: 400 })
    }

    // Format phone number (ensure it starts with +1 for US numbers)
    let formattedPhone = phone.replace(/\D/g, '') // Remove non-digits
    if (formattedPhone.length === 10) {
      formattedPhone = '+1' + formattedPhone
    } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
      formattedPhone = '+' + formattedPhone
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone
    }

    // Get business information if businessId provided
    let businessName = templateData.businessName
    if (businessId && !businessName) {
      const { data: business } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', businessId)
        .single()
      
      if (business) {
        templateData.businessName = business.name
        businessName = business.name
      }
    }

    // Get customer information if customerId provided
    if (customerId && !templateData.customerName) {
      const { data: customer } = await supabase
        .from('customers')
        .select('first_name, last_name')
        .eq('id', customerId)
        .single()
      
      if (customer) {
        templateData.customerName = `${customer.first_name} ${customer.last_name}`.trim()
      }
    }

    // Get appointment information if appointmentId provided
    if (appointmentId && (!templateData.appointmentDate || !templateData.serviceName)) {
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          appointment_date,
          start_time,
          service:services(name, base_price),
          location:locations(name, address)
        `)
        .eq('id', appointmentId)
        .single()
      
      if (appointment) {
        templateData.appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        })
        templateData.appointmentTime = appointment.start_time
        templateData.serviceName = appointment.service?.name
        templateData.servicePrice = appointment.service?.base_price?.toString()
        templateData.location = appointment.location?.name
        
        // Generate confirmation code if not provided
        if (!templateData.confirmationCode) {
          templateData.confirmationCode = appointmentId.substring(0, 8).toUpperCase()
        }
      }
    }

    // Set default business name if still not available
    if (!templateData.businessName) {
      templateData.businessName = 'Your Nail Salon'
    }

    // Determine final message
    let finalMessage: string
    if (template) {
      finalMessage = SMSTemplates.getTemplate(template, templateData)
    } else {
      finalMessage = message!
    }

    console.log('📤 Sending SMS:', { 
      to: formattedPhone, 
      template, 
      messagePreview: finalMessage.substring(0, 50) + '...' 
    })

    // Send SMS using Twilio service
    const result = await TwilioService.sendSMS(formattedPhone, finalMessage)

    if (result.success) {
      // Log SMS in database
      await logSMS({
        businessId,
        customerId,
        appointmentId,
        phone: formattedPhone,
        messageType: template || 'custom',
        message: finalMessage,
        twilioMessageId: result.messageId!,
        status: 'sent'
      })

      console.log('✅ SMS sent successfully:', result.messageId)

      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        status: result.status,
        phone: formattedPhone,
        template,
        message: 'SMS sent successfully'
      })
    } else {
      console.error('❌ SMS failed:', result.error)
      
      // Log failed SMS
      await logSMS({
        businessId,
        customerId,
        appointmentId,
        phone: formattedPhone,
        messageType: template || 'custom',
        message: finalMessage,
        status: 'failed',
        errorMessage: result.error
      })

      return NextResponse.json({
        success: false,
        error: result.error,
        phone: formattedPhone
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('❌ SMS API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'SMS sending failed'
    }, { status: 500 })
  }
}

// GET endpoint to test SMS configuration
export async function GET(request: NextRequest) {
  try {
    const testResult = await TwilioService.testConnection()
    
    return NextResponse.json({
      configured: testResult.success,
      phoneNumber: testResult.phoneNumber,
      error: testResult.error,
      availableTemplates: [
        'confirmation',
        'reminder24',
        'reminder2',
        'cancellation', 
        'rescheduled',
        'receipt',
        'welcome',
        'loyalty',
        'promotion',
        'birthday',
        'available',
        'reminder_service',
        'no_show',
        'review',
        'holiday',
        'staff',
        'urgent'
      ],
      requiredFields: ['phone'],
      optionalFields: ['message', 'template', 'templateData', 'businessId', 'customerId', 'appointmentId']
    })
  } catch (error: any) {
    return NextResponse.json({
      configured: false,
      error: error.message
    }, { status: 500 })
  }
}

async function logSMS(data: {
  businessId?: string
  customerId?: string
  appointmentId?: string
  phone: string
  messageType: string
  message: string
  twilioMessageId?: string
  status: string
  errorMessage?: string
}): Promise<void> {
  try {
    await supabase
      .from('sms_logs')
      .insert({
        business_id: data.businessId,
        customer_id: data.customerId,
        appointment_id: data.appointmentId,
        recipient_phone: data.phone,
        message_type: data.messageType,
        message_content: data.message,
        twilio_message_id: data.twilioMessageId,
        status: data.status,
        error_message: data.errorMessage,
        sent_at: new Date().toISOString()
      })

    console.log('📝 SMS logged in database')
  } catch (error) {
    console.error('❌ Error logging SMS:', error)
    // Don't fail the SMS sending if logging fails
  }
}

// Helper function to send common SMS types
export class SMSHelpers {
  static async sendAppointmentConfirmation(appointmentId: string): Promise<boolean> {
    try {
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:customers(phone, first_name, last_name),
          service:services(name, base_price),
          business:businesses(name),
          location:locations(name)
        `)
        .eq('id', appointmentId)
        .single()

      if (!appointment || !appointment.customer?.phone) {
        console.error('❌ Appointment or customer phone not found')
        return false
      }

      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: appointment.customer.phone,
          template: 'confirmation',
          businessId: appointment.business_id,
          customerId: appointment.customer_id,
          appointmentId: appointmentId
        })
      })

      return response.ok
    } catch (error) {
      console.error('❌ Error sending appointment confirmation:', error)
      return false
    }
  }

  static async sendPaymentReceipt(appointmentId: string, amount: string, paymentMethod: string): Promise<boolean> {
    try {
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:customers(phone, first_name, last_name),
          service:services(name),
          business:businesses(name)
        `)
        .eq('id', appointmentId)
        .single()

      if (!appointment || !appointment.customer?.phone) {
        return false
      }

      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: appointment.customer.phone,
          template: 'receipt',
          templateData: {
            amount,
            paymentMethod
          },
          businessId: appointment.business_id,
          customerId: appointment.customer_id,
          appointmentId: appointmentId
        })
      })

      return response.ok
    } catch (error) {
      console.error('❌ Error sending payment receipt:', error)
      return false
    }
  }
}