import { NextRequest, NextResponse } from 'next/server'
import { SendGridService, EmailTemplateData } from '../../../../lib/sendgrid-service'
import { EmailMarketingService } from '../../../../lib/email-marketing'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface SendEmailRequest {
  to: string
  subject?: string
  content?: string
  template?: 'welcome' | 'confirmation' | 'reminder' | 'receipt' | 'promotional' | 'review'
  templateData?: EmailTemplateData
  businessId?: string
  customerId?: string
  appointmentId?: string
  isHtml?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const {
      to,
      subject,
      content,
      template,
      templateData = {},
      businessId,
      customerId,
      appointmentId,
      isHtml = true
    }: SendEmailRequest = await request.json()

    console.log('📧 Email request:', { to, template, hasContent: !!content, businessId })

    // Validate required fields
    if (!to) {
      return NextResponse.json({
        success: false,
        error: 'Recipient email is required'
      }, { status: 400 })
    }

    if (!subject && !template) {
      return NextResponse.json({
        success: false,
        error: 'Either subject/content or template is required'
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email address format'
      }, { status: 400 })
    }

    // Get business information if businessId provided
    if (businessId && !templateData.businessName) {
      const { data: business } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', businessId)
        .single()
      
      if (business) {
        templateData.businessName = business.name
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
        templateData.serviceName = (appointment.service as any)?.name
        templateData.servicePrice = (appointment.service as any)?.base_price?.toString()
        templateData.location = (appointment.location as any)?.name
        
        // Generate confirmation code if not provided
        if (!templateData.confirmationCode) {
          templateData.confirmationCode = appointmentId.substring(0, 8).toUpperCase()
        }
      }
    }

    // Set default values
    if (!templateData.businessName) {
      templateData.businessName = 'Your Nail Salon'
    }
    if (!templateData.websiteUrl) {
      templateData.websiteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yoursalon.com'
    }

    console.log('📤 Sending email:', { 
      to, 
      template, 
      subject: subject || `Template: ${template}` 
    })

    // Send email based on template or custom content
    let result
    
    if (template) {
      switch (template) {
        case 'welcome':
          result = await SendGridService.sendWelcomeEmail(to, templateData)
          break
        case 'confirmation':
          result = await SendGridService.sendAppointmentConfirmation(to, templateData)
          break
        case 'reminder':
          result = await SendGridService.sendAppointmentReminder(to, templateData, 24)
          break
        case 'receipt':
          if (!templateData.amount || !templateData.paymentMethod) {
            return NextResponse.json({
              success: false,
              error: 'Payment receipt requires amount and paymentMethod in templateData'
            }, { status: 400 })
          }
          result = await SendGridService.sendPaymentReceipt(to, templateData as any)
          break
        case 'promotional':
          result = await SendGridService.sendPromotionalEmail(to, templateData)
          break
        case 'review':
          result = await SendGridService.sendReviewRequest(to, templateData)
          break
        default:
          return NextResponse.json({
            success: false,
            error: 'Invalid template type'
          }, { status: 400 })
      }
    } else {
      // Send custom email
      result = await SendGridService.sendEmail(to, subject!, content!, isHtml)
    }

    if (result.success) {
      console.log('✅ Email sent successfully:', result.messageId)

      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        template,
        recipient: to,
        message: 'Email sent successfully'
      })
    } else {
      console.error('❌ Email failed:', result.error)

      return NextResponse.json({
        success: false,
        error: result.error,
        recipient: to
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('❌ Email API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Email sending failed'
    }, { status: 500 })
  }
}

// GET endpoint to test email configuration and show available templates
export async function GET(request: NextRequest) {
  try {
    const testResult = await SendGridService.testConnection()
    
    return NextResponse.json({
      configured: testResult.success,
      error: testResult.error,
      availableTemplates: [
        {
          name: 'welcome',
          description: 'Welcome email for new customers',
          requiredData: ['customerName', 'businessName']
        },
        {
          name: 'confirmation',
          description: 'Appointment confirmation email',
          requiredData: ['customerName', 'businessName', 'appointmentDate', 'appointmentTime', 'serviceName']
        },
        {
          name: 'reminder',
          description: 'Appointment reminder email',
          requiredData: ['customerName', 'businessName', 'appointmentDate', 'appointmentTime', 'serviceName']
        },
        {
          name: 'receipt',
          description: 'Payment receipt email',
          requiredData: ['customerName', 'businessName', 'amount', 'paymentMethod', 'serviceName']
        },
        {
          name: 'promotional',
          description: 'Promotional/marketing email',
          requiredData: ['customerName', 'businessName', 'discount']
        },
        {
          name: 'review',
          description: 'Review request email',
          requiredData: ['customerName', 'businessName']
        }
      ],
      requiredFields: ['to'],
      optionalFields: [
        'subject', 'content', 'template', 'templateData', 
        'businessId', 'customerId', 'appointmentId', 'isHtml'
      ]
    })
  } catch (error: any) {
    return NextResponse.json({
      configured: false,
      error: error.message
    }, { status: 500 })
  }
}

// Helper functions to send emails
class EmailHelpers {
  static async sendAppointmentConfirmation(appointmentId: string): Promise<boolean> {
    try {
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:customers(email, first_name, last_name),
          service:services(name, base_price),
          business:businesses(name),
          location:locations(name)
        `)
        .eq('id', appointmentId)
        .single()

      if (!appointment || !appointment.customer?.email) {
        console.error('❌ Appointment or customer email not found')
        return false
      }

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: appointment.customer.email,
          template: 'confirmation',
          businessId: appointment.business_id,
          customerId: appointment.customer_id,
          appointmentId: appointmentId
        })
      })

      return response.ok
    } catch (error) {
      console.error('❌ Error sending appointment confirmation email:', error)
      return false
    }
  }

  static async sendWelcomeEmail(customerEmail: string, businessId: string, customerId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customerEmail,
          template: 'welcome',
          businessId: businessId,
          customerId: customerId
        })
      })

      return response.ok
    } catch (error) {
      console.error('❌ Error sending welcome email:', error)
      return false
    }
  }

  static async sendPaymentReceipt(
    appointmentId: string, 
    amount: string, 
    paymentMethod: string
  ): Promise<boolean> {
    try {
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:customers(email, first_name, last_name),
          service:services(name),
          business:businesses(name)
        `)
        .eq('id', appointmentId)
        .single()

      if (!appointment || !appointment.customer?.email) {
        return false
      }

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: appointment.customer.email,
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
      console.error('❌ Error sending payment receipt email:', error)
      return false
    }
  }
}