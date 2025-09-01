import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '../../../lib/stripe-service'
import { SquareService } from '../../../lib/square-service'

export async function GET(request: NextRequest) {
  try {
    const testResults = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      stripe: {
        configured: false,
        testMode: false,
        error: null
      },
      square: {
        configured: false,
        testMode: false,
        locations: [],
        error: null
      }
    }

    // Test Stripe configuration
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        testResults.stripe.configured = true
        testResults.stripe.testMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')
        
        // Try to create a small test payment intent (don't process it)
        const testPayment = await StripeService.processPayment({
          amount: 100, // $1.00
          customerId: 'test-customer',
          appointmentId: 'test-appointment',
          businessId: '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad',
          description: 'Test payment - not processed'
        })
        
        if (!testPayment.success) {
          testResults.stripe.error = testPayment.error
        }
      } else {
        testResults.stripe.error = 'STRIPE_SECRET_KEY not configured'
      }
    } catch (error: any) {
      testResults.stripe.error = error.message
    }

    // Test Square configuration
    try {
      if (process.env.SQUARE_ACCESS_TOKEN) {
        testResults.square.configured = true
        testResults.square.testMode = process.env.SQUARE_ENVIRONMENT !== 'production'
        
        // Test Square connection by listing locations
        const connectionTest = await SquareService.testConnection()
        
        if (connectionTest.success) {
          testResults.square.locations = connectionTest.locations || []
        } else {
          testResults.square.error = connectionTest.error
        }
      } else {
        testResults.square.error = 'SQUARE_ACCESS_TOKEN not configured'
      }
    } catch (error: any) {
      testResults.square.error = error.message
    }

    // Determine overall status
    const stripeOk = testResults.stripe.configured && !testResults.stripe.error
    const squareOk = testResults.square.configured && !testResults.square.error
    const overallStatus = (stripeOk || squareOk) ? 'ready' : 'needs_configuration'

    return NextResponse.json({
      status: overallStatus,
      message: overallStatus === 'ready' 
        ? 'Payment processing is configured and ready'
        : 'Payment processing needs configuration',
      details: testResults,
      recommendations: generateRecommendations(testResults)
    })

  } catch (error: any) {
    console.error('❌ Payment setup test error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test payment setup',
      error: error.message
    }, { status: 500 })
  }
}

function generateRecommendations(results: any): string[] {
  const recommendations: string[] = []

  if (!results.stripe.configured) {
    recommendations.push('Configure Stripe by adding STRIPE_SECRET_KEY to environment variables')
  } else if (results.stripe.error) {
    recommendations.push(`Fix Stripe configuration: ${results.stripe.error}`)
  }

  if (!results.square.configured) {
    recommendations.push('Configure Square by adding SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID to environment variables')
  } else if (results.square.error) {
    recommendations.push(`Fix Square configuration: ${results.square.error}`)
  }

  if (results.stripe.testMode && results.square.testMode) {
    recommendations.push('Both Stripe and Square are in test mode - perfect for development')
  } else if (results.stripe.testMode || results.square.testMode) {
    recommendations.push('Mixed test/production mode detected - ensure consistency')
  }

  if (results.square.configured && results.square.locations.length === 0) {
    recommendations.push('No Square locations found - verify SQUARE_LOCATION_ID is correct')
  }

  if (!results.stripe.configured && !results.square.configured) {
    recommendations.push('At least one payment processor (Stripe or Square) must be configured')
  }

  if (recommendations.length === 0) {
    recommendations.push('Payment processing is fully configured and ready to use!')
  }

  return recommendations
}

// POST endpoint for testing actual payment processing
export async function POST(request: NextRequest) {
  try {
    const { processor = 'stripe', amount = 100 } = await request.json()

    if (!['stripe', 'square'].includes(processor)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid processor. Must be "stripe" or "square"'
      }, { status: 400 })
    }

    console.log(`🧪 Testing ${processor} payment processing with $${amount / 100}`)

    const testData = {
      amount,
      customerId: 'test-customer-' + Date.now(),
      appointmentId: 'test-appointment-' + Date.now(),
      businessId: '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad',
      description: `Test ${processor} payment - DO NOT PROCESS`,
      metadata: {
        test: 'true',
        timestamp: new Date().toISOString()
      }
    }

    let result
    if (processor === 'stripe') {
      result = await StripeService.processPayment(testData)
    } else {
      result = await SquareService.processPayment({
        ...testData,
        nonce: 'cnon:card-nonce-ok' // Square test nonce
      })
    }

    return NextResponse.json({
      success: result.success,
      processor,
      testMode: true,
      result,
      warning: 'This was a test payment. No actual money was processed.'
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}