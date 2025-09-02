import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '../../../../lib/stripe-service'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('❌ Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const webhookResult = await StripeService.handleWebhook(body, signature)
    
    if (!webhookResult.success || !webhookResult.event) {
      return NextResponse.json({ error: webhookResult.error }, { status: 400 })
    }

    const event = webhookResult.event
    console.log('🎣 Processing Stripe webhook:', event.type)

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object as Stripe.Dispute)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // Handle subscription events (for plan billing)
        await handleSubscriptionEvent(event)
        break

      default:
        console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`)
    }

    return NextResponse.json({ received: true, type: event.type })

  } catch (error: any) {
    console.error('❌ Stripe webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('✅ Payment succeeded:', paymentIntent.id)

    const appointmentId = paymentIntent.metadata.appointmentId
    const customerId = paymentIntent.metadata.customerId

    if (!appointmentId) {
      console.error('❌ No appointmentId in payment intent metadata')
      return
    }

    // Update payment status in database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', paymentIntent.id)
      .select()
      .single()

    if (paymentError) {
      console.error('❌ Error updating payment status:', paymentError)
      return
    }

    console.log('💾 Payment status updated to paid:', payment.id)

    // Update appointment status to confirmed
    const { error: appointmentError } = await supabase
      .from('appointments')
      .update({
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)

    if (appointmentError) {
      console.error('❌ Error updating appointment status:', appointmentError)
      return
    }

    // Award loyalty points if applicable
    if (customerId && payment.total_amount) {
      await awardLoyaltyPoints(payment.business_id, customerId, appointmentId, payment.total_amount)
    }

    console.log('✅ Appointment confirmed after successful payment')

  } catch (error) {
    console.error('❌ Error handling payment success:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('❌ Payment failed:', paymentIntent.id)

    const appointmentId = paymentIntent.metadata.appointmentId

    // Update payment status
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', paymentIntent.id)

    // Optionally update appointment status
    if (appointmentId) {
      await supabase
        .from('appointments')
        .update({
          status: 'pending', // Keep pending until payment succeeds
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
    }

    console.log('💾 Payment and appointment status updated after failure')

  } catch (error) {
    console.error('❌ Error handling payment failure:', error)
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('🚫 Payment canceled:', paymentIntent.id)

    // Update payment status
    await supabase
      .from('payments')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', paymentIntent.id)

    console.log('💾 Payment status updated to cancelled')

  } catch (error) {
    console.error('❌ Error handling payment cancellation:', error)
  }
}

async function handleChargeDispute(dispute: Stripe.Dispute) {
  try {
    console.log('⚠️ Charge dispute created:', dispute.id)
    
    // You might want to notify business owner or create internal tickets
    // For now, just log it
    console.log('Dispute details:', {
      amount: dispute.amount,
      currency: dispute.currency,
      reason: dispute.reason,
      status: dispute.status
    })

  } catch (error) {
    console.error('❌ Error handling dispute:', error)
  }
}

async function handleSubscriptionEvent(event: Stripe.Event) {
  try {
    console.log('📋 Subscription event:', event.type)

    const subscription = event.data.object as Stripe.Subscription
    const businessId = subscription.metadata.businessId

    if (!businessId) {
      console.error('❌ No businessId in subscription metadata')
      return
    }

    let subscriptionStatus: string
    let tierUpdate: any = {}

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        subscriptionStatus = subscription.status === 'active' ? 'active' : subscription.status
        
        // Determine tier from subscription
        const planName = subscription.metadata.targetPlan || 'starter'
        tierUpdate.subscription_tier = planName
        tierUpdate.subscription_status = subscriptionStatus
        
        if ((subscription as any).current_period_end) {
          tierUpdate.trial_ends_at = new Date((subscription as any).current_period_end * 1000).toISOString()
        }
        break

      case 'customer.subscription.deleted':
        tierUpdate.subscription_status = 'cancelled'
        tierUpdate.subscription_tier = 'starter' // Downgrade to starter
        break
    }

    // Update business subscription status
    const { error } = await supabase
      .from('businesses')
      .update({
        ...tierUpdate,
        updated_at: new Date().toISOString()
      })
      .eq('id', businessId)

    if (error) {
      console.error('❌ Error updating business subscription:', error)
    } else {
      console.log('✅ Business subscription updated:', businessId)
    }

  } catch (error) {
    console.error('❌ Error handling subscription event:', error)
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
        description: `Points earned from payment`,
        created_at: new Date().toISOString()
      })

    console.log('🎯 Loyalty points awarded:', { customerId, pointsEarned })

  } catch (error) {
    console.error('❌ Error awarding loyalty points:', error)
  }
}