# Stripe Payment Setup Guide

## Issue: Card Input Not Working

The card input form is not accepting input because Stripe isn't properly configured with your business's payment processing keys.

## Quick Fix Steps:

### 1. Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Log in to your Stripe account (or create one)
3. Click "Developers" → "API Keys"
4. Copy these two keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### 2. Add Keys to Environment

Create/update your `.env.local` file in the dashboard folder:

```bash
# Stripe Configuration (REQUIRED for payment form to work)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
```

### 3. Update the Code (Temporary Fix)

In `components/PlanSelector.tsx`, line 10-11, replace:
```javascript
'pk_test_51OYourActualStripePublishableKeyHere'
```

With your actual publishable key:
```javascript
'pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY'
```

### 4. Restart Development Server

```bash
npm run dev
```

## Testing the Payment Form

### Test Card Numbers (Use these for testing):

- **Visa**: 4242 4242 4242 4242
- **Visa (debit)**: 4000 0566 5566 5556
- **Mastercard**: 5555 5555 5555 4444
- **American Express**: 3782 822463 10005

### Test Details:
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **Postal Code**: Any valid postal code (e.g., 12345)

## Webhook Configuration (For Production)

1. In Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhook/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## Current Payment Flow

1. **Trial Setup**: Card is validated with $0 authorization
2. **No Charges**: During 7-day trial period
3. **Automatic Billing**: Starts after trial expires
4. **Subscription Management**: Through Stripe Customer Portal

## Troubleshooting

### Card Input Still Not Working?

1. Check browser console for errors (F12)
2. Verify Stripe keys are correctly set
3. Make sure no ad blockers are blocking Stripe
4. Test in incognito mode

### Common Errors:

- **"Payment system not ready"** → Stripe keys not configured
- **"Card information is required"** → CardElement not loading
- **CORS errors** → Webhook endpoints need proper setup

## Production Setup

Before going live:
1. Switch to live keys (`pk_live_` and `sk_live_`)
2. Update webhook endpoints to production URLs
3. Test with real cards (small amounts)
4. Set up proper error monitoring

## Support

If payment form still doesn't work after following these steps:
1. Check browser console for specific errors
2. Verify environment variables are loaded
3. Test with different browsers
4. Contact support with console error messages
