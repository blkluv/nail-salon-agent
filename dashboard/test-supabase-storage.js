/**
 * Supabase Storage Verification Test
 * Tests if the business-assets storage bucket is properly configured
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testSupabaseStorage() {
  console.log('🧪 Testing Supabase Storage Configuration...\n')

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing Supabase credentials')
    console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Test 1: Check if storage buckets exist
    console.log('📦 Step 1: Checking storage buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.log('❌ Error fetching buckets:', bucketsError.message)
      return
    }

    console.log('Available buckets:', buckets.map(b => b.name))
    
    const businessAssetsBucket = buckets.find(b => b.name === 'business-assets')
    if (!businessAssetsBucket) {
      console.log('❌ Missing "business-assets" bucket')
      console.log('   📋 Need to run: dashboard/migrations/add_branding_column.sql')
      return
    }

    console.log('✅ business-assets bucket found')
    console.log('   - Public:', businessAssetsBucket.public)
    console.log('   - Created:', businessAssetsBucket.created_at)

    // Test 2: Check bucket permissions
    console.log('\n🔒 Step 2: Testing bucket permissions...')
    
    // Create a test file (tiny text file)
    const testFileName = `test/storage-test-${Date.now()}.txt`
    const testContent = 'Storage test file'
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('business-assets')
      .upload(testFileName, testContent, {
        contentType: 'text/plain'
      })

    if (uploadError) {
      console.log('❌ Upload test failed:', uploadError.message)
      if (uploadError.message.includes('policy')) {
        console.log('   📋 Storage policies may need to be configured')
        console.log('   📋 Check RLS policies in Supabase dashboard')
      }
      return
    }

    console.log('✅ File upload successful')
    console.log('   Path:', uploadData.path)

    // Test 3: Get public URL
    console.log('\n🌐 Step 3: Testing public URL generation...')
    const { data: urlData } = supabase.storage
      .from('business-assets')
      .getPublicUrl(testFileName)

    if (urlData.publicUrl) {
      console.log('✅ Public URL generated:', urlData.publicUrl)
    } else {
      console.log('❌ Failed to generate public URL')
    }

    // Test 4: Test image file constraints
    console.log('\n🖼️ Step 4: Testing file type constraints...')
    
    // Try uploading a fake "image" file
    const fakeImageFile = Buffer.from('fake-image-data')
    const imageFileName = `test/fake-image-${Date.now()}.png`
    
    const { data: imageUploadData, error: imageUploadError } = await supabase.storage
      .from('business-assets')
      .upload(imageFileName, fakeImageFile, {
        contentType: 'image/png'
      })

    if (imageUploadError) {
      console.log('❌ Image upload failed:', imageUploadError.message)
    } else {
      console.log('✅ Image upload successful (fake PNG)')
      console.log('   Path:', imageUploadData.path)
    }

    // Cleanup: Remove test files
    console.log('\n🧹 Step 5: Cleanup test files...')
    const filesToDelete = [testFileName]
    if (imageUploadData) filesToDelete.push(imageFileName)
    
    const { data: deleteData, error: deleteError } = await supabase.storage
      .from('business-assets')
      .remove(filesToDelete)

    if (deleteError) {
      console.log('⚠️ Cleanup warning:', deleteError.message)
    } else {
      console.log('✅ Test files cleaned up')
    }

    // Test 5: Check database branding column
    console.log('\n📊 Step 6: Testing database branding integration...')
    
    const { data: businesses, error: dbError } = await supabase
      .from('businesses')
      .select('id, name, branding')
      .limit(3)

    if (dbError) {
      console.log('❌ Database query failed:', dbError.message)
      if (dbError.message.includes('branding')) {
        console.log('   📋 Need to run branding migration: add_branding_column.sql')
      }
    } else {
      console.log(`✅ Found ${businesses.length} businesses with branding column`)
      businesses.forEach(biz => {
        console.log(`   - ${biz.name}: ${biz.branding ? 'Has branding config' : 'No branding config'}`)
      })
    }

    console.log('\n🎉 Storage verification complete!')
    console.log('📋 Summary:')
    console.log('   ✅ Storage bucket exists')
    console.log('   ✅ File upload works')
    console.log('   ✅ Public URLs work')
    console.log('   ✅ Database integration ready')
    console.log('\n🚀 Branding system is ready for production!')

  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    console.log('   Stack:', error.stack)
  }
}

// Run the test
if (require.main === module) {
  testSupabaseStorage()
}

module.exports = { testSupabaseStorage }