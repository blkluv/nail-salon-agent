// Test Supabase connection with new key
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://irvyhhkoiyzartmmvbxw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTgyOTMsImV4cCI6MjA3MDY5NDI5M30.EArkK7byT7CZkQVL1B905qDwlCyq8TQenRZnkTl-5Ms'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testSupabaseConnection() {
  try {
    console.log('🔄 Testing Supabase with NEW key...');
    
    const { data, error, count } = await supabase
      .from('businesses')
      .select('id, name', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.error('❌ Still failing:', error);
      return false;
    }
    
    console.log('✅ SUCCESS! Supabase connection working with new key!');
    console.log('Found', count, 'businesses in database');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

testSupabaseConnection();