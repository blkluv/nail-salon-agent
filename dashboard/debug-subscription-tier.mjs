// Debug the subscription_tier column issue systematically
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://irvyhhkoiyzartmmvbxw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTgyOTMsImV4cCI6MjA3MDY5NDI5M30.EArkK7byT7CZkQVL1B905qDwlCyq8TQenRZnkTl-5Ms'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk'

async function debugSubscriptionTier() {
  console.log('🔍 TROUBLESHOOTING: subscription_tier column issue\n');
  
  // Test 1: Check with anon key
  console.log('TEST 1: Checking with ANON key...');
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    const { data, error } = await anonClient
      .from('businesses')
      .select('id, name, subscription_tier')
      .limit(1);
      
    if (error) {
      console.log('❌ ANON key failed:', error.message);
      console.log('Error code:', error.code);
    } else {
      console.log('✅ ANON key works! Found subscription_tier column');
    }
  } catch (err) {
    console.log('❌ ANON key exception:', err.message);
  }
  
  console.log('\nTEST 2: Checking with SERVICE ROLE key...');
  const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    const { data, error } = await serviceClient
      .from('businesses')
      .select('id, name, subscription_tier')
      .limit(1);
      
    if (error) {
      console.log('❌ SERVICE key failed:', error.message);
    } else {
      console.log('✅ SERVICE key works! Found subscription_tier column');
    }
  } catch (err) {
    console.log('❌ SERVICE key exception:', err.message);
  }
  
  console.log('\nTEST 3: Check what columns actually exist...');
  try {
    const { data, error } = await anonClient
      .from('businesses')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log('❌ Cannot get any columns:', error.message);
    } else if (data && data.length > 0) {
      console.log('✅ Available columns:', Object.keys(data[0]).join(', '));
      
      if (Object.keys(data[0]).includes('subscription_tier')) {
        console.log('🎯 subscription_tier IS PRESENT in the data!');
      } else {
        console.log('❌ subscription_tier is MISSING from the data');
      }
    } else {
      console.log('⚠️  No data in businesses table');
    }
  } catch (err) {
    console.log('❌ Exception getting columns:', err.message);
  }
  
  console.log('\nTEST 4: Try direct insert without subscription_tier...');
  try {
    const testBusiness = {
      name: 'Test Business',
      slug: 'test-business-debug-' + Date.now(),
      address_line1: '123 Test St',
      city: 'Test City',
      state: 'CA'
      // Intentionally NOT including subscription_tier to see what happens
    };
    
    const { data, error } = await anonClient
      .from('businesses')
      .insert(testBusiness)
      .select('id, name, subscription_tier');
      
    if (error) {
      console.log('❌ Insert failed:', error.message);
      console.log('Full error:', error);
    } else {
      console.log('✅ Insert succeeded! Default subscription_tier:', data[0]?.subscription_tier);
    }
  } catch (err) {
    console.log('❌ Insert exception:', err.message);
  }
}

debugSubscriptionTier();