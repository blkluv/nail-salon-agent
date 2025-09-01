import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    console.log('🔧 Running schema fix for businesses table...')

    // Add missing columns to businesses table
    const { data: addColumnsResult, error: addColumnsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add missing columns to businesses table
        ALTER TABLE businesses 
        ADD COLUMN IF NOT EXISTS address_line1 varchar(255),
        ADD COLUMN IF NOT EXISTS address_line2 varchar(255),
        ADD COLUMN IF NOT EXISTS city varchar(100),
        ADD COLUMN IF NOT EXISTS state varchar(50),
        ADD COLUMN IF NOT EXISTS postal_code varchar(20),
        ADD COLUMN IF NOT EXISTS country varchar(100) DEFAULT 'US',
        ADD COLUMN IF NOT EXISTS timezone varchar(50) DEFAULT 'America/Los_Angeles',
        ADD COLUMN IF NOT EXISTS vapi_assistant_id varchar(255),
        ADD COLUMN IF NOT EXISTS vapi_phone_number_id varchar(255),
        ADD COLUMN IF NOT EXISTS vapi_phone_number varchar(20),
        ADD COLUMN IF NOT EXISTS vapi_configured boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}';
      `
    })

    if (addColumnsError) {
      console.error('❌ Error adding columns:', addColumnsError)
      // Try direct SQL approach
      const alterQueries = [
        "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS country varchar(100) DEFAULT 'US'",
        "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS timezone varchar(50) DEFAULT 'America/Los_Angeles'",
        "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS address_line1 varchar(255)",
        "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS address_line2 varchar(255)",
        "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS city varchar(100)",
        "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS state varchar(50)",
        "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS postal_code varchar(20)",
        "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_assistant_id varchar(255)",
        "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_phone_number_id varchar(255)",
        "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_phone_number varchar(20)",
        "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_configured boolean DEFAULT false",
        "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'"
      ]

      const results = []
      for (const query of alterQueries) {
        try {
          const { data, error } = await supabase.rpc('exec', { query })
          if (error) {
            console.warn(`⚠️ Query failed (might already exist): ${query}`, error.message)
          } else {
            console.log(`✅ Query succeeded: ${query}`)
          }
          results.push({ query, success: !error, error: error?.message })
        } catch (err) {
          console.warn(`⚠️ Query failed: ${query}`, err)
          results.push({ query, success: false, error: (err as any).message })
        }
      }
      
      // Continue with verification even if some queries failed
    }

    // Verify the columns exist now
    const { data: columns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'businesses')
      .in('column_name', ['country', 'timezone', 'address_line1', 'city', 'state', 'postal_code', 'vapi_assistant_id', 'settings'])

    if (verifyError) {
      console.error('❌ Error verifying columns:', verifyError)
      return NextResponse.json({
        success: false,
        error: `Verification failed: ${verifyError.message}`,
        details: verifyError
      }, { status: 500 })
    }

    console.log('✅ Schema fix completed successfully')
    console.log('📋 Current columns:', columns)

    return NextResponse.json({
      success: true,
      message: 'Schema fix completed successfully',
      columnsAdded: columns?.map(c => c.column_name) || [],
      columnDetails: columns
    })

  } catch (error) {
    console.error('❌ Schema fix failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Schema fix failed',
      details: (error as any).message
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Just check current schema
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'businesses')
      .order('column_name')

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    const missingColumns = [
      'country', 'timezone', 'address_line1', 'city', 'state', 'postal_code',
      'vapi_assistant_id', 'vapi_phone_number_id', 'vapi_phone_number', 'vapi_configured', 'settings'
    ].filter(col => !columns?.some(c => c.column_name === col))

    return NextResponse.json({
      success: true,
      currentColumns: columns?.map(c => c.column_name) || [],
      missingColumns,
      needsFix: missingColumns.length > 0,
      columnDetails: columns
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as any).message
    }, { status: 500 })
  }
}