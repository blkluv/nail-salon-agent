import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting Maya job and branding fields migration...')
    
    // List of columns to add to businesses table
    const columnsToAdd = [
      { name: 'maya_job_id', type: 'text' },
      { name: 'brand_personality', type: 'text' },
      { name: 'business_description', type: 'text' },
      { name: 'unique_selling_points', type: 'jsonb', default: "'[]'::jsonb" },
      { name: 'target_customer', type: 'text' },
      { name: 'price_range', type: 'text' },
      { name: 'owner_first_name', type: 'text' },
      { name: 'owner_last_name', type: 'text' },
      { name: 'agent_id', type: 'text' },
      { name: 'agent_type', type: 'text' },
      { name: 'phone_number', type: 'text' }
    ]

    const results = []
    
    // Instead of ALTER TABLE, let's try to verify what columns already exist
    console.log('🔍 Checking existing table structure...')
    
    // First, let's check if we can read from businesses table with any existing columns
    const { data: existingData, error: readError } = await supabase
      .from('businesses')
      .select('*')
      .limit(1)
    
    if (readError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot access businesses table: ' + readError.message,
        results
      })
    }

    console.log('✅ Businesses table accessible')
    
    // Check what columns already exist by examining the response
    const existingColumns = existingData && existingData.length > 0 
      ? Object.keys(existingData[0])
      : []
    
    console.log('📊 Existing columns:', existingColumns)
    
    const missingColumns = columnsToAdd.filter(col => 
      !existingColumns.includes(col.name)
    )
    
    console.log('📋 Missing columns:', missingColumns.map(c => c.name))
    
    if (missingColumns.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All Maya job and branding columns already exist!',
        existingColumns,
        results: ['All columns already present']
      })
    }

    // Try to add missing columns using UPDATE (which might fail gracefully)
    // This is a workaround since we can't run ALTER TABLE directly
    
    // Let's try a different approach - test if columns exist by trying to select them
    for (const column of columnsToAdd) {
      try {
        const { error: selectError } = await supabase
          .from('businesses')
          .select(column.name)
          .limit(1)
        
        if (selectError) {
          results.push({
            column: column.name,
            status: 'missing',
            error: selectError.message
          })
        } else {
          results.push({
            column: column.name,
            status: 'exists'
          })
        }
      } catch (err) {
        results.push({
          column: column.name,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    const missingCount = results.filter(r => r.status === 'missing').length
    const existingCount = results.filter(r => r.status === 'exists').length

    return NextResponse.json({
      success: missingCount === 0,
      message: `Migration check complete. ${existingCount} columns exist, ${missingCount} columns missing.`,
      existingColumns,
      results,
      needsManualMigration: missingCount > 0,
      migrationInstructions: missingCount > 0 ? 
        'Please run the following SQL in Supabase dashboard:\n\n' +
        missingColumns.map(col => 
          `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}${col.default ? ` DEFAULT ${col.default}` : ''};`
        ).join('\n') : null
    })

  } catch (error) {
    console.error('❌ Migration API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}