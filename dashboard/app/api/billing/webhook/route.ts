import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil'  
  })

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    console.error('❌ Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
  
  console.log('🎯 Stripe webhook received:', event.type)
  
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
        break
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
        
      default:
        console.log(`🔄 Unhandled event type: ${event.type}`)
    }
    
    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('❌ Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { businessId, targetPlan } = session.metadata || {}
  
  if (!businessId || !targetPlan) {
    console.error('Missing metadata in checkout session')
    return
  }
  
  console.log('✅ Checkout completed:', { businessId, targetPlan })
  
  // Update business subscription
  const { error } = await supabase
    .from('businesses')
    .update({
      subscription_tier: targetPlan,
      subscription_status: 'active',
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      updated_at: new Date().toISOString()
    })
    .eq('id', businessId)
  
  if (error) {
    console.error('❌ Failed to update business subscription:', error)
  } else {
    console.log('✅ Business subscription updated successfully')
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('🎉 Subscription created:', subscription.id)
  
  // Additional subscription setup if needed
  const customerId = subscription.customer as string
  
  // Find business by Stripe customer ID
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single()
  
  if (business) {
    console.log('✅ Subscription linked to business:', business.name)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id)
  
  const customerId = subscription.customer as string
  const status = subscription.status
  
  // Update business subscription status
  const { error } = await supabase
    .from('businesses')
    .update({
      subscription_status: mapStripeStatus(status),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)
  
  if (error) {
    console.error('❌ Failed to update subscription status:', error)
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  console.log('🚫 Subscription canceled:', subscription.id)
  
  const customerId = subscription.customer as string
  
  // Update business to downgrade to starter
  const { error } = await supabase
    .from('businesses')
    .update({
      subscription_tier: 'starter',
      subscription_status: 'cancelled',
      stripe_subscription_id: null,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)
  
  if (error) {
    console.error('❌ Failed to handle subscription cancellation:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Payment succeeded:', invoice.id)
  
  // Record successful payment in our database
  const customerId = invoice.customer as string
  
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single()
  
  if (business) {
    // Record payment in payments table
    await supabase
      .from('payments')
      .insert({
        business_id: business.id,
        stripe_invoice_id: invoice.id,
        amount: (invoice.amount_paid || 0) / 100, // Convert from cents
        total_amount: (invoice.amount_paid || 0) / 100,
        status: 'paid',
        payment_method: 'stripe_subscription',
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
    
    console.log('✅ Payment recorded for business:', business.name)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ Payment failed:', invoice.id)
  
  const customerId = invoice.customer as string
  
  // Update business status to past_due
  const { error } = await supabase
    .from('businesses')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)
  
  if (error) {
    console.error('❌ Failed to update past due status:', error)
  }
}

function mapStripeStatus(stripeStatus: string): string {
  const statusMap = {
    'active': 'active',
    'past_due': 'past_due',
    'canceled': 'cancelled',
    'unpaid': 'past_due',
    'trialing': 'trialing',
    'incomplete': 'past_due',
    'incomplete_expired': 'cancelled'
  }
  return statusMap[stripeStatus as keyof typeof statusMap] || 'cancelled'
}