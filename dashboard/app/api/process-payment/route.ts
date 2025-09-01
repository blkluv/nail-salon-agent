import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '../../../lib/stripe-service'
import { SquareService } from '../../../lib/square-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface ProcessPaymentRequest {
  processor: 'stripe' | 'square'
  amount: number // in cents
  customerId: string
  appointmentId: string
  businessId: string
  locationId?: string
  paymentMethod?: string
  nonce?: string // For Square
  description?: string
  tipAmount?: number
  taxAmount?: number
  metadata?: Record<string, string>
}

export async function POST(request: NextRequest) {
  try {
    const {
      processor,
      amount,
      customerId,
      appointmentId,
      businessId,
      locationId,
      paymentMethod,
      nonce,
      description,
      tipAmount = 0,
      taxAmount = 0,
      metadata = {}
    }: ProcessPaymentRequest = await request.json()

    console.log('💳 Processing payment:', { 
      processor, 
      businessId, 
      appointmentId, 
      amount: amount / 100,
      tipAmount: tipAmount / 100,
      taxAmount: taxAmount / 100
    })

    // Validate required fields
    if (!processor || !amount || !customerId || !appointmentId || !businessId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: processor, amount, customerId, appointmentId, businessId'
      }, { status: 400 })
    }

    // Validate processor type
    if (!['stripe', 'square'].includes(processor)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid payment processor. Must be "stripe" or "square"'
      }, { status: 400 })
    }

    // Calculate total amount
    const totalAmount = amount + tipAmount + taxAmount

    // Validate business exists
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

    // Validate appointment exists
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        service:services(name, base_price),
        customer:customers(first_name, last_name, email, phone)
      `)
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json({
        success: false,
        error: 'Appointment not found'
      }, { status: 404 })
    }

    // Process payment based on processor type
    let result
    if (processor === 'stripe') {
      result = await StripeService.processPayment({
        amount: totalAmount,
        customerId,
        appointmentId,
        businessId,
        locationId,
        description,
        metadata: {
          ...metadata,
          tipAmount: tipAmount.toString(),
          taxAmount: taxAmount.toString(),
          subtotalAmount: amount.toString()
        }
      })
    } else if (processor === 'square') {
      result = await SquareService.processPayment({
        amount: totalAmount,
        customerId,
        appointmentId,
        businessId,
        locationId,
        nonce,
        description,
        metadata: {
          ...metadata,
          tipAmount: tipAmount.toString(),
          taxAmount: taxAmount.toString(),
          subtotalAmount: amount.toString()
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid payment processor'
      }, { status: 400 })
    }

    if (result.success) {
      // Record payment in database
      const paymentData = {
        business_id: businessId,
        customer_id: customerId,
        appointment_id: appointmentId,
        location_id: locationId,
        subtotal_amount: amount,
        tip_amount: tipAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        processor_type: processor,
        transaction_id: result.transactionId || result.paymentIntentId,
        status: processor === 'stripe' ? 'processing' : 'paid', // Stripe requires confirmation, Square is immediate
        payment_method: paymentMethod || 'unknown',
        currency: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('💾 Recording payment in database:', paymentData)

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single()

      if (paymentError) {
        console.error('❌ Error recording payment:', paymentError)
        // Payment was processed but not recorded - this needs attention
        return NextResponse.json({
          success: false,
          error: 'Payment processed but not recorded in database',
          transactionId: result.transactionId || result.paymentIntentId
        }, { status: 500 })
      }

      // Update appointment status if payment successful
      if (processor === 'square') { // Square payments are immediate
        await supabase
          .from('appointments')
          .update({ 
            status: 'confirmed',
            total_amount: totalAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', appointmentId)
      }

      console.log('✅ Payment processed successfully:', {
        paymentId: payment.id,
        transactionId: result.transactionId || result.paymentIntentId
      })

      const response: any = {
        success: true,
        paymentId: payment.id,
        transactionId: result.transactionId || result.paymentIntentId,
        message: processor === 'stripe' 
          ? 'Payment initiated successfully. Complete payment on client side.' 
          : 'Payment processed successfully'
      }

      // Add Stripe-specific data
      if (processor === 'stripe' && result.clientSecret) {
        response.clientSecret = result.clientSecret
      }

      return NextResponse.json(response)

    } else {
      console.error('❌ Payment processing failed:', result.error)
      
      return NextResponse.json({
        success: false,
        error: result.error || 'Payment processing failed',
        processor
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('❌ Payment API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

// Handle GET requests to test the endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Payment processing endpoint is active',
    supportedProcessors: ['stripe', 'square'],
    requiredFields: [
      'processor',
      'amount',
      'customerId', 
      'appointmentId',
      'businessId'
    ],
    optionalFields: [
      'locationId',
      'paymentMethod',
      'nonce',
      'description',
      'tipAmount',
      'taxAmount',
      'metadata'
    ]
  })
}