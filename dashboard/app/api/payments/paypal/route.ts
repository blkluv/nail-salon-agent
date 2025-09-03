import { NextRequest, NextResponse } from 'next/server'
import { PayPalService } from '../../../../lib/paypal-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'create_order': {
        const { appointmentId, amount, businessId, customerId, locationId } = data
        
        // Validate required fields
        if (!appointmentId || !amount || !businessId || !customerId) {
          return NextResponse.json({
            success: false,
            error: 'Missing required fields: appointmentId, amount, businessId, customerId'
          }, { status: 400 })
        }

        const result = await PayPalService.createOrder({
          appointmentId,
          amount: parseFloat(amount),
          businessId,
          customerId,
          locationId,
          description: data.description
        })

        if (!result.success) {
          return NextResponse.json(result, { status: 400 })
        }

        // Store payment record in database
        if (result.orderId) {
          await supabase.from('payments').insert({
            id: result.orderId,
            business_id: businessId,
            customer_id: customerId,
            appointment_id: appointmentId,
            location_id: locationId,
            amount_cents: Math.round(parseFloat(amount) * 100),
            currency: 'USD',
            processor: 'paypal',
            processor_payment_id: result.orderId,
            status: 'pending',
            payment_method: 'paypal',
            metadata: {
              approval_url: result.approvalUrl,
              created_at: new Date().toISOString()
            }
          })
        }

        return NextResponse.json(result)
      }

      case 'capture_order': {
        const { orderId } = data
        
        if (!orderId) {
          return NextResponse.json({
            success: false,
            error: 'Order ID is required'
          }, { status: 400 })
        }

        const result = await PayPalService.captureOrder(orderId)

        if (result.success) {
          // Update payment status in database
          await supabase
            .from('payments')
            .update({
              status: 'completed',
              processor_payment_id: result.transactionId,
              completed_at: new Date().toISOString(),
              metadata: {
                captured_at: new Date().toISOString()
              }
            })
            .eq('id', orderId)

          // Update appointment status to confirmed if payment successful
          const { data: payment } = await supabase
            .from('payments')
            .select('appointment_id')
            .eq('id', orderId)
            .single()

          if (payment?.appointment_id) {
            await supabase
              .from('appointments')
              .update({
                status: 'confirmed',
                payment_status: 'paid'
              })
              .eq('id', payment.appointment_id)
          }
        }

        return NextResponse.json(result)
      }

      case 'refund': {
        const { captureId, amount, reason } = data
        
        if (!captureId) {
          return NextResponse.json({
            success: false,
            error: 'Capture ID is required'
          }, { status: 400 })
        }

        const result = await PayPalService.refundPayment(
          captureId, 
          amount ? parseFloat(amount) : undefined, 
          reason
        )

        if (result.success) {
          // Update payment status in database
          await supabase
            .from('payments')
            .update({
              status: amount ? 'partially_refunded' : 'refunded',
              refunded_at: new Date().toISOString(),
              refund_amount_cents: amount ? Math.round(parseFloat(amount) * 100) : null
            })
            .eq('processor_payment_id', captureId)
        }

        return NextResponse.json(result)
      }

      case 'get_order': {
        const { orderId } = data
        
        if (!orderId) {
          return NextResponse.json({
            success: false,
            error: 'Order ID is required'
          }, { status: 400 })
        }

        const order = await PayPalService.getOrder(orderId)
        return NextResponse.json({
          success: !!order,
          order
        })
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 })
    }
  } catch (error: any) {
    console.error('❌ PayPal API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

// Handle PayPal webhooks
export async function GET(request: NextRequest) {
  try {
    // Simple health check endpoint
    return NextResponse.json({
      success: true,
      message: 'PayPal API endpoint is active',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('❌ PayPal health check error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}