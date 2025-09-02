/**
 * Run Branding Migration Script
 * Creates storage bucket and adds branding column to businesses table
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

async function runBrandingMigration() {
  console.log('🚀 Running Branding Migration...\n')

  // Initialize Supabase client with service role key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing Supabase credentials')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'add_branding_column.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration file loaded:', migrationPath)
    console.log('📝 SQL content preview:')
    console.log(migrationSQL.split('\n').slice(0, 5).join('\n') + '\n...\n')

    // Split the migration into individual statements
    // Note: This is a simple approach - more complex migrations might need better parsing
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
      
      // Show a preview of what we're running
      const preview = statement.substring(0, 60).replace(/\s+/g, ' ')
      console.log(`   ${preview}${statement.length > 60 ? '...' : ''}`)

      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.log(`❌ Statement ${i + 1} failed:`, error.message)
          
          // Continue with other statements for non-critical errors
          if (error.message.includes('already exists') || 
              error.message.includes('already contains') ||
              error.message.includes('ON CONFLICT')) {
            console.log('   ⚠️ Continuing (likely already exists)...')
            continue
          } else {
            throw error
          }
        }
        
        console.log(`✅ Statement ${i + 1} completed`)
      } catch (execError) {
        console.log(`❌ Failed to execute statement ${i + 1}:`, execError.message)
        
        // Try a different approach for storage bucket creation
        if (statement.includes('INSERT INTO storage.buckets')) {
          console.log('   🔄 Trying alternative storage bucket creation...')
          
          // Try using the storage client directly
          const { data: createBucketData, error: createBucketError } = await supabase.storage
            .createBucket('business-assets', {
              public: true,
              fileSizeLimit: 5242880,
              allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
            })
          
          if (createBucketError) {
            console.log('   ❌ Alternative bucket creation failed:', createBucketError.message)
          } else {
            console.log('   ✅ Storage bucket created via storage client')
          }
        }
      }
    }

    console.log('\n🎉 Migration execution complete!')
    console.log('\n🔍 Verifying results...')

    // Verify the migration worked
    // Check 1: Storage bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    if (bucketsError) {
      console.log('❌ Could not verify buckets:', bucketsError.message)
    } else {
      const businessBucket = buckets.find(b => b.name === 'business-assets')
      if (businessBucket) {
        console.log('✅ Storage bucket "business-assets" exists')
        console.log('   - Public:', businessBucket.public)
        console.log('   - ID:', businessBucket.id)
      } else {
        console.log('❌ Storage bucket not found after migration')
      }
    }

    // Check 2: Branding column exists
    const { data: testBusiness, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, branding')
      .limit(1)
      .single()

    if (businessError) {
      console.log('❌ Could not verify branding column:', businessError.message)
    } else {
      console.log('✅ Branding column exists on businesses table')
      console.log('   Sample business branding:', testBusiness?.branding)
    }

    console.log('\n🚀 Branding system is now ready!')
    console.log('📋 Next steps:')
    console.log('   1. Test branding page: /dashboard/settings/branding')
    console.log('   2. Try uploading a logo file')
    console.log('   3. Verify public URLs work')

  } catch (error) {
    console.log('❌ Migration failed:', error.message)
    console.log('   Stack:', error.stack)
    console.log('\n📋 Manual migration steps:')
    console.log('   1. Go to Supabase Dashboard > SQL Editor')
    console.log('   2. Run the SQL from: dashboard/migrations/add_branding_column.sql')
    console.log('   3. Check Storage > Create "business-assets" bucket manually')
  }
}

// Run the migration
if (require.main === module) {
  runBrandingMigration()
}

module.exports = { runBrandingMigration }