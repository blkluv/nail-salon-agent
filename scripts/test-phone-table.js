// Test phone_numbers table specifically
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testPhoneTable() {
  console.log('🔍 Testing phone_numbers table...\n');
  
  try {
    // Test 1: Check if table exists by querying it
    console.log('1. Testing table existence...');
    const { data, error } = await supabase
      .from('phone_numbers')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ FAIL - Phone numbers table does not exist');
      console.log('   Error:', error.message);
      console.log('\n📝 TO FIX: Run this SQL in Supabase SQL Editor:');
      console.log('   File: C:\\Users\\escot\\vapi-nail-salon-agent\\database\\phone_numbers_migration.sql');
      return false;
    }
    
    console.log('✅ PASS - Phone numbers table exists');
    
    // Test 2: Check demo data
    console.log('2. Testing demo phone number data...');
    const { data: demoPhone } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('vapi_phone_number_id', 'demo-vapi-phone-123')
      .single();
    
    if (demoPhone) {
      console.log('✅ PASS - Demo phone number found');
      console.log(`   Phone: ${demoPhone.phone_number}`);
      console.log(`   Type: ${demoPhone.phone_number_type}`);
    } else {
      console.log('❌ FAIL - Demo phone number not found');
      return false;
    }
    
    // Test 3: Check table structure
    console.log('3. Testing table structure...');
    const { data: allPhones } = await supabase
      .from('phone_numbers')  
      .select('id, business_id, vapi_phone_number_id, phone_number, phone_number_type, is_active')
      .limit(1);
    
    if (allPhones && allPhones.length > 0) {
      const phone = allPhones[0];
      const expectedFields = ['id', 'business_id', 'vapi_phone_number_id', 'phone_number', 'phone_number_type', 'is_active'];
      const hasAllFields = expectedFields.every(field => phone.hasOwnProperty(field));
      
      if (hasAllFields) {
        console.log('✅ PASS - Table has all required fields');
      } else {
        console.log('❌ FAIL - Table missing required fields');
        return false;
      }
    }
    
    console.log('\n🎉 Phone numbers table test: ALL TESTS PASSED');
    return true;
    
  } catch (error) {
    console.log('❌ FAIL - Unexpected error:', error.message);
    return false;
  }
}

testPhoneTable();