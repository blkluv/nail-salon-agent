import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('Fixing address column schema mismatch...')

    // Add missing address columns
    const addColumns = `
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS address_line1 TEXT;
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS address_line2 TEXT;
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US';
    `
    
    await supabase.rpc('execute_sql', { sql: addColumns })
    
    // Migrate existing address data
    const migrateData = `
      UPDATE businesses 
      SET address_line1 = address 
      WHERE address_line1 IS NULL AND address IS NOT NULL;
    `
    
    await supabase.rpc('execute_sql', { sql: migrateData })

    // Create index
    const createIndex = `
      CREATE INDEX IF NOT EXISTS idx_businesses_address ON businesses(address_line1);
    `
    
    await supabase.rpc('execute_sql', { sql: createIndex })

    return NextResponse.json({
      success: true,
      message: 'Address schema fixed successfully',
      changes: [
        'Added address_line1 column',
        'Added address_line2 column', 
        'Added country column',
        'Migrated existing address data to address_line1',
        'Created address search index'
      ]
    })

  } catch (error: any) {
    console.error('Address schema fix error:', error)
    
    // Try a simpler approach - direct column additions
    try {
      const { data, error: directError } = await supabase
        .from('businesses')
        .select('id')
        .limit(1)
        .single()
        
      if (directError) {
        return NextResponse.json({
          success: false,
          error: 'Database connection issue',
          details: directError.message
        }, { status: 500 })
      }

      return NextResponse.json({
        success: false,
        error: 'Schema migration failed - needs manual intervention',
        details: error.message,
        recommendation: 'Run SQL migration directly in Supabase console'
      }, { status: 500 })
      
    } catch (connectionError: any) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError.message
      }, { status: 500 })
    }
  }
}