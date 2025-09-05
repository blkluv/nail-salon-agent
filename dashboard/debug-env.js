// Debug script to check environment variables
console.log('=== ENVIRONMENT VARIABLE DEBUG ===')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY exists:', !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY)

if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.log('Stripe key preview:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 12) + '...')
} else {
  console.log('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set!')
}

// List all environment variables that start with NEXT_PUBLIC_
const nextPublicVars = Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
console.log('All NEXT_PUBLIC_ variables:', nextPublicVars)