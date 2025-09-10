/**
 * Maya Job Database Migration Executor
 * Attempts to execute the critical database migration programmatically
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

console.log('🚀 Maya Job Database Migration Executor')
console.log('=' .repeat(60))

async function executeMayaMigration() {
  try {
    console.log('📋 Step 1: Reading migration script...')
    
    // Read the SQL migration script
    const sqlScript = fs.readFileSync(path.join(__dirname, 'manual-migration.sql'), 'utf8')
    console.log('✅ Migration script loaded successfully')
    
    console.log('\n📋 Step 2: Executing ALTER TABLE commands...')
    
    // Individual ALTER TABLE commands (most likely to succeed)
    const alterCommands = [
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS maya_job_id text",
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS brand_personality text", 
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_description text",
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS unique_selling_points jsonb DEFAULT '[]'::jsonb",
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS target_customer text",
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS price_range text",
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS agent_id text",
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS agent_type text", 
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS phone_number text"
    ]
    
    console.log(`Attempting to execute ${alterCommands.length} ALTER TABLE commands...`)
    
    let successCount = 0
    let errorCount = 0
    const results = []
    
    // Try to execute via direct query (this may not work due to RLS)
    for (const [index, command] of alterCommands.entries()) {
      console.log(`\n${index + 1}. ${command}`)
      
      try {
        // Try the direct approach first (may fail)
        const { error } = await supabase.rpc('exec', { sql: command })
        
        if (error) {
          console.log(`   ⚠️  Direct execution not supported: ${error.message}`)
          
          // Try alternative approach - test if column exists by querying
          const columnName = command.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1]
          if (columnName) {
            const { error: testError } = await supabase
              .from('businesses')
              .select(columnName)
              .limit(1)
            
            if (testError && testError.message.includes('does not exist')) {
              results.push({ command, status: 'NEEDS_MANUAL_EXECUTION', column: columnName })
              errorCount++
              console.log(`   ❌ Column ${columnName} missing - needs manual execution`)
            } else if (!testError) {
              results.push({ command, status: 'ALREADY_EXISTS', column: columnName })
              successCount++
              console.log(`   ✅ Column ${columnName} already exists`)
            } else {
              results.push({ command, status: 'ERROR', error: testError.message })
              errorCount++
              console.log(`   ❌ Error checking column: ${testError.message}`)
            }
          }
        } else {
          results.push({ command, status: 'SUCCESS' })
          successCount++
          console.log(`   ✅ Command executed successfully`)
        }
        
      } catch (err) {
        results.push({ command, status: 'ERROR', error: err.message })
        errorCount++
        console.log(`   ❌ Error: ${err.message}`)
      }
    }
    
    console.log('\n📊 Migration Execution Results:')
    console.log(`   ✅ Successful/Existing: ${successCount}`)
    console.log(`   ❌ Need Manual Execution: ${errorCount}`)
    
    // Show detailed results
    console.log('\n📋 Detailed Results:')
    results.forEach((result, index) => {
      const status = result.status === 'SUCCESS' || result.status === 'ALREADY_EXISTS' ? '✅' : 
                   result.status === 'NEEDS_MANUAL_EXECUTION' ? '⚠️' : '❌'
      console.log(`${index + 1}. ${status} ${result.column || 'Command'}: ${result.status}`)
    })
    
    // Determine next steps
    const needsManualExecution = results.filter(r => r.status === 'NEEDS_MANUAL_EXECUTION')
    
    if (needsManualExecution.length === 0) {
      console.log('\n🎉 SUCCESS: All Maya job columns are ready!')
      console.log('✅ Database migration is complete')
      console.log('✅ Maya job system should now be fully functional')
      
      // Test the migration
      await testMayaJobSystem()
      
    } else {
      console.log('\n⚠️  MANUAL EXECUTION REQUIRED')
      console.log(`${needsManualExecution.length} columns need to be added manually`)
      console.log('\n📋 INSTRUCTIONS:')
      console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard')
      console.log('2. Select your project: irvyhhkoiyzartmmvbxw')
      console.log('3. Navigate to SQL Editor > New Query')
      console.log('4. Copy and paste this complete SQL script:')
      console.log('\n' + '='.repeat(50))
      console.log('-- Maya Job Database Migration')
      console.log('-- Copy everything between the lines and paste in Supabase SQL Editor')
      console.log('')
      console.log(sqlScript)
      console.log('='.repeat(50))
      console.log('\n5. Click "Run" to execute the migration')
      console.log('6. Come back and run this script again to verify success')
    }
    
  } catch (error) {
    console.error('❌ Migration execution failed:', error.message)
    
    console.log('\n📋 FALLBACK: Manual Execution Required')
    console.log('Due to execution error, please run the migration manually:')
    console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard')
    console.log('2. Select your project and navigate to SQL Editor')
    console.log('3. Run the SQL script in manual-migration.sql')
  }
}

async function testMayaJobSystem() {
  console.log('\n🧪 Testing Maya Job System...')
  
  try {
    // Test if we can now query the new columns
    const { data, error } = await supabase
      .from('businesses')
      .select('id, maya_job_id, brand_personality, agent_id, agent_type, phone_number')
      .limit(1)
    
    if (error) {
      console.error('❌ Maya job system test failed:', error.message)
      return false
    }
    
    console.log('✅ Maya job system test successful!')
    console.log('✅ All Maya job columns are accessible')
    
    if (data && data.length > 0) {
      const business = data[0]
      console.log('\n📄 Sample business record with Maya job fields:')
      console.log(`   ID: ${business.id}`)
      console.log(`   Maya Job ID: ${business.maya_job_id || 'NULL (ready for data)'}`)
      console.log(`   Brand Personality: ${business.brand_personality || 'NULL (ready for data)'}`)
      console.log(`   Agent ID: ${business.agent_id || 'NULL (ready for data)'}`)
      console.log(`   Agent Type: ${business.agent_type || 'NULL (ready for data)'}`)
      console.log(`   Phone Number: ${business.phone_number || 'NULL (ready for data)'}`)
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Maya job system test error:', error.message)
    return false
  }
}

// Execute the migration
executeMayaMigration()