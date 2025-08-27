// Apply schema updates to fix missing columns
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://irvyhhkoiyzartmmvbxw.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk'

// Use service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing columns to businesses table...');
    
    // Add the missing address columns to businesses table
    const alterBusinessesQuery = `
    ALTER TABLE businesses 
    ADD COLUMN IF NOT EXISTS address_line1 varchar(255),
    ADD COLUMN IF NOT EXISTS address_line2 varchar(255),
    ADD COLUMN IF NOT EXISTS city varchar(100),
    ADD COLUMN IF NOT EXISTS state varchar(50),
    ADD COLUMN IF NOT EXISTS postal_code varchar(20),
    ADD COLUMN IF NOT EXISTS country varchar(100) DEFAULT 'US',
    ADD COLUMN IF NOT EXISTS timezone varchar(50) DEFAULT 'America/Los_Angeles';
    `;
    
    const { error: alterError } = await supabase.rpc('exec_sql', { 
      query: alterBusinessesQuery 
    });
    
    if (alterError) {
      console.error('❌ Failed to add columns:', alterError);
      // Try direct SQL approach
      console.log('🔧 Trying alternative approach...');
      
      const { error } = await supabase.from('businesses').select('address_line1').limit(0);
      if (error && error.code === '42703') {
        console.log('⚡ Need to add address_line1 column directly via SQL');
        console.log('📝 SQL to run in Supabase dashboard:');
        console.log('ALTER TABLE businesses ADD COLUMN IF NOT EXISTS address_line1 varchar(255);');
        console.log('ALTER TABLE businesses ADD COLUMN IF NOT EXISTS city varchar(100);');
        console.log('ALTER TABLE businesses ADD COLUMN IF NOT EXISTS state varchar(50);');
        return false;
      }
    }
    
    console.log('✅ Successfully added missing columns');
    
    // Verify the columns were added
    console.log('🔍 Verifying schema update...');
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, address_line1, city, state')
      .limit(1);
    
    if (error) {
      console.error('❌ Verification failed:', error.message);
      return false;
    }
    
    console.log('✅ Schema verification successful!');
    return true;
    
  } catch (error) {
    console.error('❌ Schema update failed:', error);
    return false;
  }
}

addMissingColumns();