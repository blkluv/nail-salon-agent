// Verify what actually exists in the database after running the SQL
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://irvyhhkoiyzartmmvbxw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function verifyDatabaseState() {
  console.log('🔍 VERIFYING: What actually exists in the database\n');
  
  // Check 1: Do the enums exist?
  console.log('CHECK 1: Do the enums exist?');
  try {
    const { data, error } = await supabase.rpc('get_enum_values', { enum_name: 'subscription_tier' });
    if (error) {
      console.log('❌ subscription_tier enum does not exist:', error.message);
    } else {
      console.log('✅ subscription_tier enum exists with values:', data);
    }
  } catch (err) {
    // Try alternative method - direct SQL query
    console.log('🔄 Trying alternative enum check...');
    
    const { data: enumData, error: enumError } = await supabase
      .rpc('exec_sql', { 
        query: "SELECT unnest(enum_range(NULL::subscription_tier)) AS enum_value;" 
      });
      
    if (enumError) {
      console.log('❌ Enum check failed - subscription_tier enum does NOT exist');
    } else {
      console.log('✅ subscription_tier enum exists!');
    }
  }
  
  // Check 2: What columns exist in businesses table?
  console.log('\nCHECK 2: What columns exist in businesses table?');
  try {
    const { data, error } = await supabase
      .rpc('exec_sql', { 
        query: `
          SELECT column_name, data_type, column_default 
          FROM information_schema.columns 
          WHERE table_name = 'businesses' 
          ORDER BY ordinal_position;
        `
      });
      
    if (error) {
      console.log('❌ Cannot query column info:', error.message);
    } else {
      console.log('📋 ACTUAL columns in businesses table:');
      data.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) default: ${col.column_default || 'none'}`);
      });
      
      const hasSubscriptionTier = data.some(col => col.column_name === 'subscription_tier');
      if (hasSubscriptionTier) {
        console.log('✅ subscription_tier column EXISTS');
      } else {
        console.log('❌ subscription_tier column is MISSING');
      }
    }
  } catch (err) {
    console.log('❌ Column check failed:', err.message);
  }
  
  // Check 3: Can we manually create the column?
  console.log('\nCHECK 3: Attempting to manually add subscription_tier column...');
  try {
    // First create the enum
    const { error: enumError } = await supabase
      .rpc('exec_sql', { 
        query: "CREATE TYPE subscription_tier AS ENUM ('starter', 'professional', 'enterprise');" 
      });
      
    if (enumError && !enumError.message.includes('already exists')) {
      console.log('❌ Failed to create enum:', enumError.message);
    } else {
      console.log('✅ Enum created or already exists');
    }
    
    // Then add the column
    const { error: colError } = await supabase
      .rpc('exec_sql', { 
        query: "ALTER TABLE businesses ADD COLUMN subscription_tier subscription_tier DEFAULT 'starter';" 
      });
      
    if (colError && !colError.message.includes('already exists')) {
      console.log('❌ Failed to add column:', colError.message);
    } else {
      console.log('✅ Column added successfully');
    }
  } catch (err) {
    console.log('❌ Manual creation failed:', err.message);
  }
}

verifyDatabaseState();