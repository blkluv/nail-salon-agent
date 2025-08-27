// Check what tables and columns actually exist in the database
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://irvyhhkoiyzartmmvbxw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTgyOTMsImV4cCI6MjA3MDY5NDI5M30.EArkK7byT7CZkQVL1B905qDwlCyq8TQenRZnkTl-5Ms'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function checkDatabaseStatus() {
  console.log('🔍 Checking database tables and their status...\n');
  
  const requiredTables = [
    'businesses',
    'staff', 
    'services',
    'customers',
    'appointments',
    'business_hours',
    'phone_numbers'
  ];
  
  for (const tableName of requiredTables) {
    try {
      console.log(`📋 Checking ${tableName} table...`);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: EXISTS`);
        if (data && data.length > 0) {
          console.log(`   📊 Sample columns: ${Object.keys(data[0]).join(', ')}`);
        } else {
          // Try to get column info even if no data
          const { error: insertError } = await supabase
            .from(tableName)
            .insert({})
            .select()
            .limit(0);
          if (insertError && insertError.message.includes('null value')) {
            const columns = insertError.message.match(/column "([^"]+)"/g);
            if (columns) {
              console.log(`   📊 Required columns found: ${columns.join(', ')}`);
            }
          }
        }
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err.message}`);
    }
    console.log('');
  }
}

checkDatabaseStatus();