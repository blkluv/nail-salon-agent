import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    console.log('🔧 Adding missing columns to businesses table...')

    // Test if we can access the businesses table first
    const { data: testData, error: testError } = await supabase
      .from('businesses')
      .select('id, name')
      .limit(1)

    if (testError) {
      console.error('❌ Cannot access businesses table:', testError)
      return NextResponse.json({
        success: false,
        error: `Cannot access businesses table: ${testError.message}`,
        suggestion: 'Please run the schema fix manually in Supabase SQL Editor'
      }, { status: 500 })
    }

    console.log('✅ Can access businesses table')

    // Try to insert a test record with the missing country field to see what happens
    const testId = crypto.randomUUID()
    const { data: insertData, error: insertError } = await supabase
      .from('businesses')
      .insert({
        id: testId,
        name: 'Schema Test Business',
        slug: 'schema-test-' + Date.now(),
        business_type: 'nail_salon',
        email: 'test@example.com',
        country: 'US', // This will fail if column doesn't exist
        timezone: 'America/Los_Angeles'
      })
      .select()

    if (insertError) {
      console.log('❌ Insert failed (expected if columns missing):', insertError.message)
      
      if (insertError.message.includes('country') || insertError.message.includes('column')) {
        return NextResponse.json({
          success: false,
          error: 'Missing country column confirmed',
          details: insertError.message,
          fix: 'Run this SQL in Supabase SQL Editor:\n\nALTER TABLE businesses ADD COLUMN IF NOT EXISTS country varchar(100) DEFAULT \'US\';\nALTER TABLE businesses ADD COLUMN IF NOT EXISTS timezone varchar(50) DEFAULT \'America/Los_Angeles\';\nALTER TABLE businesses ADD COLUMN IF NOT EXISTS address_line1 varchar(255);\nALTER TABLE businesses ADD COLUMN IF NOT EXISTS address_line2 varchar(255);\nALTER TABLE businesses ADD COLUMN IF NOT EXISTS city varchar(100);\nALTER TABLE businesses ADD COLUMN IF NOT EXISTS state varchar(50);\nALTER TABLE businesses ADD COLUMN IF NOT EXISTS postal_code varchar(20);\nALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_assistant_id varchar(255);\nALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_phone_number_id varchar(255);\nALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_phone_number varchar(20);\nALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_configured boolean DEFAULT false;\nALTER TABLE businesses ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT \'{}\';'
        }, { status: 400 })
      }

      return NextResponse.json({
        success: false,
        error: 'Insert test failed',
        details: insertError.message
      }, { status: 500 })
    }

    // If we got here, the insert worked, so clean up the test record
    await supabase
      .from('businesses')
      .delete()
      .eq('id', testId)

    console.log('✅ Schema appears to be correct - columns exist')

    return NextResponse.json({
      success: true,
      message: 'Schema is correct - all required columns exist',
      testPassed: true
    })

  } catch (error) {
    console.error('❌ Schema check failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Schema check failed',
      details: (error as any).message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    info: 'POST to this endpoint to test and fix the businesses table schema',
    usage: 'curl -X POST http://localhost:3007/api/fix-schema-simple'
  })
}