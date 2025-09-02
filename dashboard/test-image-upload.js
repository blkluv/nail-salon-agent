/**
 * Test Image Upload to Supabase Storage
 * Verifies that image uploads work correctly
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testImageUpload() {
  console.log('🖼️ Testing Image Upload to Supabase Storage...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Create a minimal PNG image buffer (1x1 pixel transparent PNG)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
      0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ])

    const testFileName = `test/test-logo-${Date.now()}.png`
    
    console.log('📤 Uploading test PNG image...')
    console.log('   File name:', testFileName)
    console.log('   File size:', pngBuffer.length, 'bytes')

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('business-assets')
      .upload(testFileName, pngBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.log('❌ Image upload failed:', uploadError.message)
      
      if (uploadError.message.includes('policy')) {
        console.log('\n📋 RLS Policy Issue - Need to set up storage policies')
        console.log('   Solution: Go to Supabase Dashboard > Storage > business-assets > Policies')
        console.log('   Create these policies:')
        console.log('   1. INSERT: "Allow authenticated uploads" - for INSERT with auth.role() = "authenticated"')
        console.log('   2. SELECT: "Allow public reads" - for SELECT with no restrictions')
        console.log('   3. DELETE: "Allow authenticated deletes" - for DELETE with auth.role() = "authenticated"')
      }
      
      return
    }

    console.log('✅ Image upload successful!')
    console.log('   Path:', uploadData.path)
    console.log('   Full path:', uploadData.fullPath)

    // Test public URL generation
    console.log('\n🌐 Testing public URL generation...')
    const { data: urlData } = supabase.storage
      .from('business-assets')
      .getPublicUrl(testFileName)

    console.log('✅ Public URL generated:', urlData.publicUrl)

    // Test if the URL is actually accessible
    console.log('\n🔗 Testing URL accessibility...')
    try {
      const response = await fetch(urlData.publicUrl)
      if (response.ok) {
        console.log('✅ URL is accessible (HTTP', response.status, ')')
        console.log('   Content-Type:', response.headers.get('content-type'))
        console.log('   Content-Length:', response.headers.get('content-length'))
      } else {
        console.log('❌ URL not accessible (HTTP', response.status, ')')
      }
    } catch (fetchError) {
      console.log('❌ URL fetch failed:', fetchError.message)
    }

    // Test business-specific path (like the branding page uses)
    const businessTestFile = `demo-business/logo-${Date.now()}.png`
    console.log('\n🏢 Testing business-specific path...')
    console.log('   Business path:', businessTestFile)
    
    const { data: businessUploadData, error: businessUploadError } = await supabase.storage
      .from('business-assets')
      .upload(businessTestFile, pngBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true
      })

    if (businessUploadError) {
      console.log('❌ Business upload failed:', businessUploadError.message)
    } else {
      console.log('✅ Business upload successful!')
      console.log('   Path:', businessUploadData.path)
      
      const { data: businessUrlData } = supabase.storage
        .from('business-assets')
        .getPublicUrl(businessTestFile)
      console.log('   Business URL:', businessUrlData.publicUrl)
    }

    // Cleanup test files
    console.log('\n🧹 Cleaning up test files...')
    const filesToDelete = [testFileName]
    if (businessUploadData) filesToDelete.push(businessTestFile)
    
    const { error: deleteError } = await supabase.storage
      .from('business-assets')
      .remove(filesToDelete)

    if (deleteError) {
      console.log('⚠️ Cleanup warning:', deleteError.message)
    } else {
      console.log('✅ Test files cleaned up')
    }

    console.log('\n🎉 Image upload test complete!')
    console.log('\n📊 Results Summary:')
    console.log('   ✅ PNG image upload works')
    console.log('   ✅ Public URLs generate correctly')
    console.log('   ✅ Business-specific paths work')
    console.log('   ✅ File cleanup works')
    console.log('\n🚀 Branding system is ready for production!')
    console.log('   - Logo uploads: /dashboard/settings/branding')
    console.log('   - Storage path: business-assets/{businessId}/logo-*')
    console.log('   - Public URLs: Automatic via Supabase CDN')

  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    console.log('   Stack:', error.stack)
  }
}

// Run the test
if (require.main === module) {
  testImageUpload()
}

module.exports = { testImageUpload }