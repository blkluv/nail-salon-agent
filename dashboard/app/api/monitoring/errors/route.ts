import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { errors, timestamp } = await request.json()

    if (!errors || !Array.isArray(errors)) {
      return NextResponse.json(
        { error: 'Invalid error data format' },
        { status: 400 }
      )
    }

    // Process each error
    const processedErrors = []
    
    for (const error of errors) {
      try {
        // Sanitize and validate error data
        const sanitizedError = {
          message: error.message?.slice(0, 1000) || 'Unknown error',
          category: error.category || 'unknown',
          severity: error.severity || 'medium',
          stack: error.stack?.slice(0, 5000) || null,
          context: {
            ...error.context,
            // Remove sensitive data
            password: undefined,
            token: undefined,
            apiKey: undefined,
            secret: undefined,
          },
          timestamp: error.context?.timestamp || timestamp,
          environment: process.env.NODE_ENV || 'unknown',
        }

        processedErrors.push(sanitizedError)

        // Log critical errors immediately
        if (error.severity === 'critical') {
          console.error('CRITICAL ERROR:', sanitizedError)
          
          // Could send alerts here (email, Slack, SMS, etc.)
          // await sendCriticalErrorAlert(sanitizedError)
        }

      } catch (processingError) {
        console.error('Error processing error:', processingError)
      }
    }

    // Store errors in database (optional - create error_logs table)
    try {
      // Uncomment when error_logs table is created
      // const { error: dbError } = await supabase
      //   .from('error_logs')
      //   .insert(processedErrors)

      // if (dbError) {
      //   console.error('Failed to store errors in database:', dbError)
      // }
    } catch (dbError) {
      console.error('Database error while storing errors:', dbError)
    }

    // Log errors to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Received errors:', processedErrors)
    }

    return NextResponse.json({
      success: true,
      processed: processedErrors.length,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Error in monitoring endpoint:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process error reports',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      monitoring: {
        errorTracking: true,
        performanceMonitoring: true,
        healthChecks: true,
      }
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Monitoring service unavailable' },
      { status: 500 }
    )
  }
}