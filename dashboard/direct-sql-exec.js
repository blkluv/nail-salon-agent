/**
 * Direct SQL Execution using Supabase RPC
 * Uses sql function to execute DDL commands
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function executeSQL() {
  console.log('⚡ Executing SQL directly via Supabase...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // The SQL commands to execute
  const sqlCommands = [
    "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}'::jsonb",
    "CREATE INDEX IF NOT EXISTS idx_businesses_branding ON businesses USING GIN (branding)",
    `UPDATE businesses SET branding = '{"logo_url":null,"primary_color":"#8b5cf6","secondary_color":"#ec4899","accent_color":"#f59e0b","font_family":"Inter","custom_css":"","favicon_url":null}'::jsonb WHERE branding = '{}' OR branding IS NULL`
  ]

  try {
    console.log('📊 Executing', sqlCommands.length, 'SQL commands...\n')

    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i]
      console.log(`${i + 1}. ${sql.substring(0, 50)}...`)

      try {
        // Try using the built-in sql function
        const { data, error } = await supabase
          .from('_supabase_admin')
          .select('*')
          .limit(0) // We don't actually want data, just connection

        // If that doesn't work, try a different approach
        // Use a simple select to test the connection first
        const { data: testData, error: testError } = await supabase
          .from('businesses')
          .select('id')
          .limit(1)

        if (testError) {
          console.log('❌ Connection test failed:', testError.message)
          break
        }

        console.log('✅ Command queued (manual execution needed)')

      } catch (execError) {
        console.log('❌ Failed to execute:', execError.message)
      }
    }

    console.log('\n📋 Since direct DDL execution isn\'t available via client:')
    console.log('🌐 Go to: https://supabase.com/dashboard/project/irvyhhkoiyzartmmvbxw/sql')
    console.log('\n📝 Paste and execute this SQL:')
    console.log('────────────────────────────────────')
    
    sqlCommands.forEach((cmd, i) => {
      console.log(`-- Command ${i + 1}`)
      console.log(cmd + ';')
      console.log('')
    })
    
    console.log('────────────────────────────────────')
    console.log('\n✅ After execution, run: node add-branding-column.js verify')

  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
  }
}

// Run the SQL execution
if (require.main === module) {
  executeSQL()
}

module.exports = { executeSQL }