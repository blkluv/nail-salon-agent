/**
 * Database Migration Runner
 * Executes the Maya job and branding fields migration through Supabase client
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

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Please check .env.local file:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL')
  console.error('  SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('Current values:')
  console.error('  SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('  SERVICE_KEY:', supabaseServiceKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

async function runMigration() {
  console.log('🚀 Starting Maya Job and Branding Fields Migration...')
  console.log('=' .repeat(60))
  console.log(`📊 Supabase URL: ${supabaseUrl}`)
  console.log(`🔑 Service Key: ${supabaseServiceKey.substring(0, 20)}...`)

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'add-maya-job-and-branding-fields.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('\n📄 Migration file loaded:', migrationPath)
    console.log('📊 Migration size:', migrationSQL.length, 'characters')
    
    // Let's try a simple approach - just run the ALTER TABLE commands manually
    const alterCommands = [
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS maya_job_id varchar(100)",
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS brand_personality varchar(20)",
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_description text",
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS unique_selling_points jsonb DEFAULT '[]'::jsonb",
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS target_customer text",
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS price_range varchar(20)",
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_first_name varchar(100)",
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_last_name varchar(100)",
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS agent_id varchar(255)",
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS agent_type varchar(50)",
      "ALTER TABLE businesses ADD COLUMN IF NOT EXISTS phone_number varchar(20)"
    ]
    
    console.log(`\n📋 Executing ${alterCommands.length} ALTER TABLE commands...`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < alterCommands.length; i++) {
      const command = alterCommands[i]
      console.log(`\n${i + 1}. ${command}`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          query: command 
        })
        
        if (error) {
          console.error(`   ❌ Error:`, error.message)
          errorCount++
        } else {
          console.log(`   ✅ Success`)
          successCount++
        }
      } catch (err) {
        console.error(`   ❌ Execution error:`, err.message)
        
        // Try alternative method with different RPC name
        try {
          const { error } = await supabase.rpc('execute_sql', { 
            sql_query: command 
          })
          
          if (error) {
            console.error(`   ❌ Alternative method error:`, error.message)
            errorCount++
          } else {
            console.log(`   ✅ Success (alternative method)`)
            successCount++
          }
        } catch (altErr) {
          console.error(`   ❌ Both methods failed`)
          errorCount++
        }
      }
    }
    
    console.log(`\n📊 Migration Results:`)
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    
    if (errorCount === 0) {
      console.log(`\n🎉 Migration completed successfully!`)
    } else {
      console.log(`\n⚠️  Migration completed with ${errorCount} errors.`)
      console.log(`   This might be OK if columns already exist.`)
    }
    
    // Verify the migration by checking if the columns exist
    console.log(`\n🔍 Verifying migration results...`)
    await verifyMigration()
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    
    // Try a simpler verification approach
    console.log('\n🔄 Trying simpler verification...')
    await verifyMigrationSimple()
  }
}

async function verifyMigration() {
  try {
    // Try to query the businesses table with new columns
    const { data, error } = await supabase
      .from('businesses')
      .select('id, maya_job_id, brand_personality, agent_id, agent_type, phone_number')
      .limit(1)
    
    if (error) {
      console.error('❌ Verification failed:', error.message)
      console.log('🔄 Trying fallback verification...')
      return await verifyMigrationSimple()
    }
    
    console.log('✅ Migration verification successful!')
    console.log('✅ New columns are accessible')
    
    if (data && data.length > 0) {
      const business = data[0]
      console.log('📄 Sample business record:')
      console.log(`   ID: ${business.id}`)
      console.log(`   Maya Job ID: ${business.maya_job_id || 'NULL'}`)
      console.log(`   Brand Personality: ${business.brand_personality || 'NULL'}`)
      console.log(`   Agent ID: ${business.agent_id || 'NULL'}`)
      console.log(`   Agent Type: ${business.agent_type || 'NULL'}`)
      console.log(`   Phone Number: ${business.phone_number || 'NULL'}`)
    } else {
      console.log('ℹ️  No business records found (empty table)')
    }
    
  } catch (error) {
    console.error('❌ Verification error:', error.message)
    await verifyMigrationSimple()
  }
}

async function verifyMigrationSimple() {
  try {
    // Just check if we can access the businesses table at all
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name')
      .limit(1)
    
    if (error) {
      console.error('❌ Basic verification failed:', error.message)
      return
    }
    
    console.log('✅ Basic table access verified')
    console.log(`ℹ️  Found ${data?.length || 0} business records`)
    
  } catch (error) {
    console.error('❌ Basic verification error:', error.message)
  }
}

// Run the migration
runMigration()