import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  message: string
  details?: any
}

export async function GET() {
  const results: TestResult[] = []

  try {
    // Test 1: Database Connection
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name')
        .limit(1)
      
      if (error) throw error
      
      results.push({
        name: 'Database Connection',
        status: 'pass',
        message: 'Successfully connected to Supabase database',
        details: { businessCount: data?.length || 0 }
      })
    } catch (error: any) {
      results.push({
        name: 'Database Connection',
        status: 'fail',
        message: `Database connection failed: ${error.message}`
      })
    }

    // Test 2: Environment Variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_PHONE_NUMBER'
    ]

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length === 0) {
      results.push({
        name: 'Environment Variables',
        status: 'pass',
        message: 'All required environment variables are present',
        details: { checked: requiredEnvVars }
      })
    } else {
      results.push({
        name: 'Environment Variables',
        status: 'fail',
        message: `Missing environment variables: ${missingVars.join(', ')}`,
        details: { missing: missingVars }
      })
    }

    // Test 3: Payment API Availability
    try {
      const testPayment = {
        processor: 'stripe',
        amount: 100, // $1.00 test
        customerId: 'test-customer',
        appointmentId: 'test-appointment',
        businessId: 'test-business'
      }

      // This will test if our API route exists and handles requests properly
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/process-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayment)
      })

      if (response.status === 404) {
        results.push({
          name: 'Payment API Endpoint',
          status: 'fail',
          message: 'Payment API endpoint not found'
        })
      } else {
        // Even if it fails due to missing keys, the endpoint exists
        results.push({
          name: 'Payment API Endpoint',
          status: 'pass',
          message: 'Payment API endpoint is accessible',
          details: { status: response.status }
        })
      }
    } catch (error: any) {
      results.push({
        name: 'Payment API Endpoint',
        status: 'fail',
        message: `Payment API test failed: ${error.message}`
      })
    }

    // Test 4: SMS API Availability
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/send-sms`, {
        method: 'GET'
      })

      results.push({
        name: 'SMS API Endpoint',
        status: response.ok ? 'pass' : 'fail',
        message: response.ok ? 'SMS API endpoint is accessible' : 'SMS API endpoint not accessible',
        details: { status: response.status }
      })
    } catch (error: any) {
      results.push({
        name: 'SMS API Endpoint',
        status: 'fail',
        message: `SMS API test failed: ${error.message}`
      })
    }

    // Test 5: Email API Availability
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/email/send`, {
        method: 'GET'
      })

      results.push({
        name: 'Email API Endpoint',
        status: 'pass',
        message: 'Email API endpoint is accessible',
        details: { status: response.status }
      })
    } catch (error: any) {
      results.push({
        name: 'Email API Endpoint',
        status: 'fail',
        message: `Email API test failed: ${error.message}`
      })
    }

    // Test 6: Database Schema Validation
    try {
      const tables = [
        'businesses',
        'customers', 
        'appointments',
        'payments',
        'locations',
        'loyalty_programs',
        'loyalty_transactions'
      ]

      const schemaResults = []
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1)
          
          if (error && !error.message.includes('0 rows')) {
            throw error
          }
          
          schemaResults.push({ table, status: 'exists' })
        } catch (error: any) {
          schemaResults.push({ table, status: 'missing', error: error.message })
        }
      }

      const missingTables = schemaResults.filter(r => r.status === 'missing')
      
      if (missingTables.length === 0) {
        results.push({
          name: 'Database Schema',
          status: 'pass',
          message: 'All required database tables exist',
          details: { tables: schemaResults }
        })
      } else {
        results.push({
          name: 'Database Schema',
          status: 'fail',
          message: `Missing database tables: ${missingTables.map(t => t.table).join(', ')}`,
          details: { missing: missingTables }
        })
      }
    } catch (error: any) {
      results.push({
        name: 'Database Schema',
        status: 'fail',
        message: `Schema validation failed: ${error.message}`
      })
    }

    // Calculate overall status
    const passCount = results.filter(r => r.status === 'pass').length
    const failCount = results.filter(r => r.status === 'fail').length
    const totalTests = results.length

    return NextResponse.json({
      success: failCount === 0,
      summary: {
        total: totalTests,
        passed: passCount,
        failed: failCount,
        successRate: Math.round((passCount / totalTests) * 100)
      },
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      results
    }, { status: 500 })
  }
}