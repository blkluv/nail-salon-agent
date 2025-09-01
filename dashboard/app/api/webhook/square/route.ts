import { NextRequest, NextResponse } from 'next/server'
import { SquareService } from '../../../../lib/square-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('x-square-signature')

    console.log('🎣 Received Square webhook:', body.type || 'unknown')

    // Verify webhook signature (Square uses HMAC-SHA256)
    const webhookResult = await SquareService.handleWebhook(body, signature || undefined)
    
    if (!webhookResult.success) {
      return NextResponse.json({ error: webhookResult.error }, { status: 400 })
    }

    const event = webhookResult.event || body

    switch (event.type) {
      case 'payment.created':
        await handlePaymentCreated(event.data)
        break

      case 'payment.updated':
        await handlePaymentUpdated(event.data)
        break

      case 'refund.created':
        await handleRefundCreated(event.data)
        break

      case 'refund.updated':
        await handleRefundUpdated(event.data)
        break

      case 'dispute.created':
        await handleDisputeCreated(event.data)
        break

      case 'dispute.updated':
        await handleDisputeUpdated(event.data)
        break

      default:
        console.log(`ℹ️ Unhandled Square event type: ${event.type}`)
    }

    return NextResponse.json({ received: true, type: event.type })

  } catch (error: any) {
    console.error('❌ Square webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePaymentCreated(data: any) {
  try {
    const payment = data.object || data
    console.log('✅ Square payment created:', payment.id)

    const appointmentId = payment.metadata?.appointmentId
    const customerId = payment.metadata?.customerId

    if (!appointmentId) {
      console.error('❌ No appointmentId in payment metadata')
      return
    }

    // Update payment status in database
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: payment.status === 'COMPLETED' ? 'paid' : 'processing',
        processed_at: payment.status === 'COMPLETED' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', payment.id)
      .select()
      .single()

    if (paymentError) {
      console.error('❌ Error updating payment status:', paymentError)
      return
    }

    console.log('💾 Payment status updated:', paymentRecord.id)

    // If payment is completed, update appointment
    if (payment.status === 'COMPLETED') {
      await supabase
        .from('appointments')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)

      // Award loyalty points
      if (customerId && paymentRecord.total_amount) {
        await awardLoyaltyPoints(paymentRecord.business_id, customerId, appointmentId, paymentRecord.total_amount)
      }

      console.log('✅ Appointment confirmed after successful payment')
    }

  } catch (error) {
    console.error('❌ Error handling Square payment creation:', error)
  }
}

async function handlePaymentUpdated(data: any) {
  try {
    const payment = data.object || data
    console.log('🔄 Square payment updated:', payment.id, payment.status)

    const appointmentId = payment.metadata?.appointmentId
    const customerId = payment.metadata?.customerId

    // Update payment status
    let status = 'processing'
    if (payment.status === 'COMPLETED') status = 'paid'
    else if (payment.status === 'FAILED') status = 'failed'
    else if (payment.status === 'CANCELED') status = 'cancelled'

    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .update({
        status,
        processed_at: status === 'paid' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', payment.id)
      .select()
      .single()

    if (paymentError) {
      console.error('❌ Error updating payment status:', paymentError)
      return
    }

    // Update appointment based on payment status
    if (appointmentId) {
      let appointmentStatus = 'pending'
      if (status === 'paid') appointmentStatus = 'confirmed'
      else if (status === 'failed') appointmentStatus = 'pending'

      await supabase
        .from('appointments')
        .update({
          status: appointmentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)

      // Award loyalty points on successful payment
      if (status === 'paid' && customerId && paymentRecord.total_amount) {
        await awardLoyaltyPoints(paymentRecord.business_id, customerId, appointmentId, paymentRecord.total_amount)
      }
    }

    console.log('💾 Payment and appointment updated:', { paymentId: payment.id, status })

  } catch (error) {
    console.error('❌ Error handling Square payment update:', error)
  }
}

async function handleRefundCreated(data: any) {
  try {
    const refund = data.object || data
    console.log('💸 Square refund created:', refund.id)

    // Create refund record in database
    await supabase
      .from('payment_refunds')
      .insert({
        original_payment_id: refund.payment_id,
        refund_transaction_id: refund.id,
        refund_amount: Number(refund.amount_money?.amount || 0),
        reason: refund.reason || 'Customer request',
        status: refund.status,
        created_at: new Date().toISOString()
      })

    console.log('💾 Refund recorded in database')

  } catch (error) {
    console.error('❌ Error handling Square refund creation:', error)
  }
}

async function handleRefundUpdated(data: any) {
  try {
    const refund = data.object || data
    console.log('🔄 Square refund updated:', refund.id, refund.status)

    // Update refund status
    await supabase
      .from('payment_refunds')
      .update({
        status: refund.status,
        updated_at: new Date().toISOString()
      })
      .eq('refund_transaction_id', refund.id)

    console.log('💾 Refund status updated')

  } catch (error) {
    console.error('❌ Error handling Square refund update:', error)
  }
}

async function handleDisputeCreated(data: any) {
  try {
    const dispute = data.object || data
    console.log('⚠️ Square dispute created:', dispute.id)

    // Log dispute for business owner attention
    console.log('Dispute details:', {
      disputeId: dispute.id,
      amount: dispute.amount_money,
      reason: dispute.reason,
      state: dispute.state
    })

    // You might want to notify business owner or create internal tickets here

  } catch (error) {
    console.error('❌ Error handling Square dispute creation:', error)
  }
}

async function handleDisputeUpdated(data: any) {
  try {
    const dispute = data.object || data
    console.log('🔄 Square dispute updated:', dispute.id, dispute.state)

    // Log dispute update
    console.log('Dispute update:', {
      disputeId: dispute.id,
      state: dispute.state,
      reason: dispute.reason
    })

  } catch (error) {
    console.error('❌ Error handling Square dispute update:', error)
  }
}

async function awardLoyaltyPoints(businessId: string, customerId: string, appointmentId: string, amount: number) {
  try {
    // Check if business has loyalty program enabled
    const { data: loyaltyProgram } = await supabase
      .from('loyalty_programs')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .single()

    if (!loyaltyProgram) {
      console.log('ℹ️ No active loyalty program for business:', businessId)
      return
    }

    // Calculate points (1 point per dollar by default)
    const pointsEarned = Math.floor(amount / 100) * (loyaltyProgram.points_per_dollar || 1)
    
    if (pointsEarned <= 0) return

    // Add loyalty transaction
    await supabase
      .from('loyalty_transactions')
      .insert({
        business_id: businessId,
        customer_id: customerId,
        appointment_id: appointmentId,
        transaction_type: 'earned',
        points_amount: pointsEarned,
        description: `Points earned from Square payment`,
        created_at: new Date().toISOString()
      })

    console.log('🎯 Loyalty points awarded:', { customerId, pointsEarned })

  } catch (error) {
    console.error('❌ Error awarding loyalty points:', error)
  }
}