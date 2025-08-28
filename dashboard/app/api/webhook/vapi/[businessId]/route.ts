import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface VapiWebhookPayload {
  message: {
    type: string
    content?: string
    toolCalls?: any[]
  }
  call?: {
    id: string
    status: string
    startedAt?: string
    endedAt?: string
  }
  customer?: {
    name?: string
    phone?: string
    email?: string
  }
  [key: string]: any
}

export async function POST(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const businessId = params.businessId
    const body: VapiWebhookPayload = await request.json()
    
    console.log(`📞 Webhook received for business ${businessId}:`, {
      type: body.message?.type,
      callId: body.call?.id,
      status: body.call?.status
    })

    // Verify business exists and is active
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .eq('status', 'active')
      .single()

    if (businessError || !business) {
      console.error(`❌ Business not found or inactive: ${businessId}`)
      return NextResponse.json(
        { error: 'Business not found or inactive' },
        { status: 404 }
      )
    }

    // Route based on message type
    switch (body.message?.type) {
      case 'function-call':
        return handleFunctionCall(businessId, body)
      
      case 'conversation-update':
        return handleConversationUpdate(businessId, body)
      
      case 'call-start':
        return handleCallStart(businessId, body)
      
      case 'call-end':
        return handleCallEnd(businessId, body)
      
      default:
        console.log(`ℹ️ Unhandled message type: ${body.message?.type}`)
        return NextResponse.json({ received: true })
    }

  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleFunctionCall(businessId: string, payload: VapiWebhookPayload) {
  const toolCall = payload.message.toolCalls?.[0]
  if (!toolCall) {
    return NextResponse.json({ error: 'No tool call found' }, { status: 400 })
  }

  console.log(`🔧 Function call for ${businessId}:`, toolCall.function?.name)

  switch (toolCall.function?.name) {
    case 'book_appointment':
      return bookAppointment(businessId, toolCall.function.arguments)
    
    case 'check_availability':
      return checkAvailability(businessId, toolCall.function.arguments)
    
    case 'get_services':
      return getServices(businessId)
    
    default:
      return NextResponse.json({
        error: `Unknown function: ${toolCall.function?.name}`
      }, { status: 400 })
  }
}

async function bookAppointment(businessId: string, args: any) {
  try {
    console.log(`📅 Booking appointment for business ${businessId}:`, args)

    // Parse arguments
    const { customerName, customerPhone, service, date, time, notes } = args

    if (!customerName || !customerPhone || !service || !date || !time) {
      return NextResponse.json({
        error: 'Missing required booking information',
        message: 'I need your name, phone number, preferred service, date, and time to book your appointment.'
      }, { status: 400 })
    }

    // Create or find customer
    let { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', businessId)
      .eq('phone', customerPhone)
      .single()

    if (customerError && customerError.code !== 'PGRST116') {
      console.error('❌ Customer lookup error:', customerError)
      throw customerError
    }

    if (!customer) {
      // Create new customer
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          id: crypto.randomUUID(),
          business_id: businessId,
          name: customerName,
          phone: customerPhone,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ Customer creation error:', createError)
        throw createError
      }
      customer = newCustomer
    }

    // Find service
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .ilike('name', `%${service}%`)
      .eq('is_active', true)
      .single()

    if (serviceError || !serviceData) {
      return NextResponse.json({
        error: 'Service not found',
        message: `I couldn't find the service "${service}". Let me check what services we offer.`,
        available_services: await getAvailableServices(businessId)
      }, { status: 400 })
    }

    // Parse date and time
    const appointmentDateTime = new Date(`${date} ${time}`)
    if (isNaN(appointmentDateTime.getTime())) {
      return NextResponse.json({
        error: 'Invalid date or time format',
        message: 'Please provide the date in MM/DD/YYYY format and time in HH:MM AM/PM format.'
      }, { status: 400 })
    }

    // Check if time slot is available
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('business_id', businessId)
      .eq('date', appointmentDateTime.toISOString().split('T')[0])
      .eq('time', time)
      .eq('status', 'confirmed')

    if (existingAppointments && existingAppointments.length > 0) {
      return NextResponse.json({
        error: 'Time slot not available',
        message: `That time slot is already booked. Let me check other available times for ${date}.`
      }, { status: 409 })
    }

    // Create appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        id: crypto.randomUUID(),
        business_id: businessId,
        customer_id: customer.id,
        service_id: serviceData.id,
        date: appointmentDateTime.toISOString().split('T')[0],
        time: time,
        duration: serviceData.duration,
        price: serviceData.price,
        status: 'confirmed',
        notes: notes || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (appointmentError) {
      console.error('❌ Appointment creation error:', appointmentError)
      throw appointmentError
    }

    console.log(`✅ Appointment booked successfully: ${appointment.id}`)

    return NextResponse.json({
      success: true,
      message: `Perfect! I've booked your ${serviceData.name} appointment for ${date} at ${time}. Your appointment is confirmed!`,
      appointment: {
        id: appointment.id,
        service: serviceData.name,
        date: date,
        time: time,
        duration: serviceData.duration,
        price: serviceData.price,
        customer: customerName
      }
    })

  } catch (error) {
    console.error('❌ Booking error:', error)
    return NextResponse.json({
      error: 'Booking failed',
      message: 'I apologize, but there was an issue processing your booking. Please try again or call us directly.'
    }, { status: 500 })
  }
}

async function checkAvailability(businessId: string, args: any) {
  try {
    const { date, service } = args
    
    // Get business hours (default to 9 AM - 6 PM)
    const businessHours = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']
    
    // Get existing appointments for the date
    const { data: appointments } = await supabase
      .from('appointments')
      .select('time')
      .eq('business_id', businessId)
      .eq('date', date)
      .eq('status', 'confirmed')

    const bookedTimes = appointments?.map(apt => apt.time) || []
    const availableTimes = businessHours.filter(time => !bookedTimes.includes(time))

    return NextResponse.json({
      success: true,
      available_times: availableTimes,
      message: availableTimes.length > 0 
        ? `We have ${availableTimes.length} time slots available on ${date}.`
        : `Unfortunately, we're fully booked on ${date}. Would you like to check another date?`
    })

  } catch (error) {
    console.error('❌ Availability check error:', error)
    return NextResponse.json({
      error: 'Availability check failed',
      message: 'I apologize, but I cannot check availability right now. Please try again.'
    }, { status: 500 })
  }
}

async function getServices(businessId: string) {
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    const serviceList = services?.map(service => ({
      name: service.name,
      duration: service.duration,
      price: service.price,
      description: service.description
    })) || []

    return NextResponse.json({
      success: true,
      services: serviceList,
      message: serviceList.length > 0 
        ? 'Here are our available services:'
        : 'We are currently updating our service menu. Please call us directly for available services.'
    })

  } catch (error) {
    console.error('❌ Services fetch error:', error)
    return NextResponse.json({
      error: 'Services fetch failed',
      message: 'I apologize, but I cannot retrieve our services right now. Please call us directly.'
    }, { status: 500 })
  }
}

async function getAvailableServices(businessId: string) {
  const { data: services } = await supabase
    .from('services')
    .select('name')
    .eq('business_id', businessId)
    .eq('is_active', true)
  
  return services?.map(s => s.name) || ['Basic Manicure', 'Gel Manicure', 'Pedicure']
}

async function handleConversationUpdate(businessId: string, payload: VapiWebhookPayload) {
  // Log conversation for analytics
  console.log(`💬 Conversation update for ${businessId}`)
  return NextResponse.json({ received: true })
}

async function handleCallStart(businessId: string, payload: VapiWebhookPayload) {
  console.log(`📞 Call started for ${businessId}: ${payload.call?.id}`)
  return NextResponse.json({ received: true })
}

async function handleCallEnd(businessId: string, payload: VapiWebhookPayload) {
  console.log(`📞 Call ended for ${businessId}: ${payload.call?.id}`)
  return NextResponse.json({ received: true })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  return NextResponse.json({
    message: `Webhook endpoint for business ${params.businessId}`,
    status: 'active',
    timestamp: new Date().toISOString()
  })
}