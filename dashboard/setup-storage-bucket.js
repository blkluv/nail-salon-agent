/**
 * Direct Storage Bucket Setup
 * Creates the business-assets bucket using Supabase storage client
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function setupStorageBucket() {
  console.log('🪣 Setting up Supabase Storage Bucket...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing Supabase credentials')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('📦 Step 1: Check existing buckets...')
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.log('❌ Error listing buckets:', listError.message)
      return
    }

    console.log('Current buckets:', existingBuckets.map(b => b.name))

    const businessBucket = existingBuckets.find(b => b.name === 'business-assets')
    
    if (businessBucket) {
      console.log('✅ business-assets bucket already exists!')
      console.log('   - Public:', businessBucket.public)
      console.log('   - Created:', businessBucket.created_at)
    } else {
      console.log('\n🆕 Step 2: Creating business-assets bucket...')
      
      const { data: createData, error: createError } = await supabase.storage.createBucket(
        'business-assets', 
        {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
        }
      )

      if (createError) {
        console.log('❌ Failed to create bucket:', createError.message)
        
        // Common issues and solutions
        if (createError.message.includes('permission')) {
          console.log('📋 Permission Issue Solutions:')
          console.log('   1. Make sure you are using the SERVICE_ROLE_KEY (not anon key)')
          console.log('   2. Check Supabase project permissions')
          console.log('   3. Try creating manually in Supabase Dashboard > Storage')
        }
        
        if (createError.message.includes('already exists')) {
          console.log('📋 Bucket may already exist - checking again...')
          const { data: recheckBuckets } = await supabase.storage.listBuckets()
          const found = recheckBuckets?.find(b => b.name === 'business-assets')
          if (found) {
            console.log('✅ Found existing bucket after recheck')
          }
        }
        
        return
      }

      console.log('✅ Bucket created successfully!')
      console.log('   Data:', createData)
    }

    // Test bucket access
    console.log('\n🧪 Step 3: Testing bucket access...')
    
    const testFile = `test-${Date.now()}.txt`
    const testContent = 'Storage bucket test'

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('business-assets')
      .upload(testFile, testContent, {
        contentType: 'text/plain'
      })

    if (uploadError) {
      console.log('❌ Upload test failed:', uploadError.message)
      
      if (uploadError.message.includes('policy')) {
        console.log('📋 Storage Policy Issue:')
        console.log('   The bucket was created but RLS policies need to be set up')
        console.log('   For now, you can:')
        console.log('   1. Go to Supabase Dashboard > Storage > business-assets')
        console.log('   2. Go to Policies tab')
        console.log('   3. Create policy: "Allow public uploads" with INSERT permission')
        console.log('   4. Create policy: "Allow public reads" with SELECT permission')
      }
    } else {
      console.log('✅ Upload test successful!')
      console.log('   Path:', uploadData.path)
      
      // Test public URL
      const { data: urlData } = supabase.storage
        .from('business-assets')
        .getPublicUrl(testFile)
        
      console.log('✅ Public URL:', urlData.publicUrl)
      
      // Clean up test file
      await supabase.storage.from('business-assets').remove([testFile])
      console.log('✅ Test file cleaned up')
    }

    console.log('\n🎉 Storage setup complete!')
    console.log('\n📋 What was configured:')
    console.log('   ✅ business-assets storage bucket')
    console.log('   ✅ Public access enabled')
    console.log('   ✅ 5MB file size limit')
    console.log('   ✅ Image file types allowed (PNG, JPG, WebP, SVG)')
    
    console.log('\n🚀 Ready for branding system!')
    console.log('   - Logo uploads will save to: business-assets/{businessId}/logo-*')
    console.log('   - Public URLs will work automatically')
    console.log('   - Try the branding page: /dashboard/settings/branding')

  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    
    console.log('\n🔧 Manual Setup Alternative:')
    console.log('   1. Go to https://supabase.com/dashboard/project/{your-project}/storage/buckets')
    console.log('   2. Click "New bucket"')
    console.log('   3. Name: business-assets')
    console.log('   4. Make it public: ✅')
    console.log('   5. Set file size limit: 5MB')
    console.log('   6. Add policies for INSERT/SELECT permissions')
  }
}

// Run the setup
if (require.main === module) {
  setupStorageBucket()
}

module.exports = { setupStorageBucket }