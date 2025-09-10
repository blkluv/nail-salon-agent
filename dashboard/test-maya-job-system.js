/**
 * Maya Job System Test
 * Tests the current state and validates if we can work around missing columns
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

async function testMayaJobSystem() {
  console.log('🧪 Testing Maya Job System Implementation')
  console.log('=' .repeat(60))

  try {
    // Test 1: Check current database state
    console.log('\n🔍 Test 1: Current Database State')
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .limit(1)

    if (businessError) {
      console.error('❌ Cannot access businesses table:', businessError.message)
      return
    }

    console.log('✅ Businesses table accessible')
    console.log('📊 Current columns:', Object.keys(businesses[0] || {}))

    // Test 2: Test provision-client API with Maya job data
    console.log('\n🔍 Test 2: Testing provision-client API')
    
    const testBusinessData = {
      plan: 'professional',
      businessInfo: {
        businessName: 'Test Maya Salon',
        businessType: 'nail-salon',
        email: 'test@mayasalon.com',
        phone: '+15551234567',
        address: '123 Test St, Test City, TS 12345',
        
        // Maya job system fields  
        mayaJobId: 'nail-salon-receptionist',
        brandPersonality: 'professional',
        businessDescription: 'Premium nail salon with expert technicians',
        uniqueSellingPoints: ['Expert nail technicians', 'Premium products', 'Relaxing atmosphere'],
        targetCustomer: 'Professionals and beauty enthusiasts',
        priceRange: 'mid-range',
        ownerFirstName: 'Maya',
        ownerLastName: 'Test'
      }
    }

    console.log('📋 Test business data prepared with Maya job fields')
    console.log('🎯 Maya Job ID:', testBusinessData.businessInfo.mayaJobId)
    console.log('🎨 Brand Personality:', testBusinessData.businessInfo.brandPersonality)

    // Test 3: Check if existing provision API handles Maya fields gracefully
    console.log('\n🔍 Test 3: API Compatibility Check')
    
    // We'll test the API by making a call to localhost
    try {
      const response = await fetch('http://localhost:3000/api/admin/provision-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testBusinessData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Provision API responded successfully')
        console.log('📄 Business ID created:', result.businessId)
        console.log('📞 Phone number:', result.phoneNumber)
        
        // Verify the created business has the Maya job data
        if (result.businessId) {
          const { data: createdBusiness, error } = await supabase
            .from('businesses')
            .select('*')
            .eq('id', result.businessId)
            .single()

          if (error) {
            console.error('❌ Cannot verify created business:', error.message)
          } else {
            console.log('🔍 Created business verification:')
            console.log('  Name:', createdBusiness.name)
            console.log('  Business Type:', createdBusiness.business_type)
            console.log('  Maya Job ID:', createdBusiness.maya_job_id || 'MISSING')
            console.log('  Brand Personality:', createdBusiness.brand_personality || 'MISSING')
            console.log('  Agent ID:', createdBusiness.agent_id || 'MISSING')
            console.log('  Agent Type:', createdBusiness.agent_type || 'MISSING')
            console.log('  Phone Number:', createdBusiness.phone_number || 'MISSING')
          }
        }
      } else {
        console.error('❌ Provision API error:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error details:', errorText)
      }
    } catch (apiError) {
      console.error('❌ API call failed:', apiError.message)
      console.log('💡 Make sure the development server is running: npm run dev')
    }

    // Test 4: Manual workaround approach
    console.log('\n🔍 Test 4: Manual Workaround Test')
    
    try {
      // Test if we can at least create a business record with existing fields
      const { data: testBusiness, error: insertError } = await supabase
        .from('businesses')
        .insert({
          name: 'Manual Test Business',
          business_type: 'nail-salon',
          email: 'manual@test.com',
          phone: '+15559876543',
          // Don't include Maya job fields to avoid errors
          subscription_tier: 'professional',
          subscription_status: 'trialing',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ Manual insert failed:', insertError.message)
      } else {
        console.log('✅ Manual business creation successful')
        console.log('📄 Created business ID:', testBusiness.id)
        
        // Clean up test data
        await supabase.from('businesses').delete().eq('id', testBusiness.id)
        console.log('🧹 Test data cleaned up')
      }
    } catch (manualError) {
      console.error('❌ Manual test error:', manualError.message)
    }

    // Test 5: Compatibility assessment
    console.log('\n📊 Maya Job System Compatibility Assessment')
    console.log('=' .repeat(60))
    
    const requiredColumns = ['maya_job_id', 'brand_personality', 'business_description', 
                           'unique_selling_points', 'target_customer', 'price_range',
                           'agent_id', 'agent_type', 'phone_number']
    
    const existingColumns = businesses.length > 0 ? Object.keys(businesses[0]) : []
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))
    const presentColumns = requiredColumns.filter(col => existingColumns.includes(col))

    console.log('✅ Present Maya columns:', presentColumns.length ? presentColumns : 'None')
    console.log('❌ Missing Maya columns:', missingColumns.length ? missingColumns : 'None')
    console.log('📊 Compatibility:', `${presentColumns.length}/${requiredColumns.length} columns ready`)

    if (missingColumns.length === 0) {
      console.log('🎉 Maya Job System is fully ready!')
    } else {
      console.log('⚠️  Maya Job System needs database migration')
      console.log('📋 Next Steps:')
      console.log('   1. Run manual-migration.sql in Supabase SQL Editor')
      console.log('   2. Re-run this test to verify success')
      console.log('   3. Test the complete onboarding flow with Maya jobs')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testMayaJobSystem()