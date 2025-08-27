// Test if Supabase database schema matches our schema.sql file
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://irvyhhkoiyzartmmvbxw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTgyOTMsImV4cCI6MjA3MDY5NDI5M30.EArkK7byT7CZkQVL1B905qDwlCyq8TQenRZnkTl-5Ms'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function checkSchemaSync() {
  try {
    console.log('🔍 Checking if businesses table has address_line1 column...');
    
    // Try to query with the column that's supposedly missing
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, address_line1, subscription_tier, subscription_status')
      .limit(1);
    
    if (error) {
      console.error('❌ Schema sync error:', error.message);
      console.error('Full error:', error);
      
      // Check what columns actually exist
      console.log('\n🔍 Checking what columns actually exist...');
      const { data: simpleData, error: simpleError } = await supabase
        .from('businesses')
        .select('*')
        .limit(1);
        
      if (simpleError) {
        console.error('❌ Even basic select failed:', simpleError);
      } else {
        console.log('✅ Businesses table exists');
        if (simpleData && simpleData.length > 0) {
          console.log('📋 Available columns:', Object.keys(simpleData[0]));
        }
      }
      return false;
    }
    
    console.log('✅ SUCCESS! Schema is properly synced');
    console.log('📊 Found', data?.length || 0, 'businesses');
    if (data && data.length > 0) {
      console.log('📋 Sample business:', data[0]);
    }
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

checkSchemaSync();