const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runPhoneMigration() {
  try {
    console.log('🔄 Creating phone_numbers table...');
    
    // Create phone_numbers table
    const { data: table, error: tableError } = await supabase
      .from('phone_numbers')
      .select('*')
      .limit(1);
    
    if (tableError && tableError.code === 'PGRST116') {
      console.log('📋 Table does not exist, need to create via SQL editor');
      console.log('Copy this SQL to your Supabase SQL editor:');
      console.log(`
-- Create phone_numbers table
CREATE TABLE phone_numbers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    vapi_phone_id VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    vapi_phone_number_id VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    assigned_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_phone_numbers_business_id ON phone_numbers(business_id);
CREATE INDEX idx_phone_numbers_vapi_id ON phone_numbers(vapi_phone_id);

-- Add columns to businesses table
ALTER TABLE businesses ADD COLUMN primary_phone_number VARCHAR(20);
ALTER TABLE businesses ADD COLUMN vapi_assistant_id VARCHAR(50);
      `);
    } else if (!tableError) {
      console.log('✅ Phone numbers table already exists');
    } else {
      console.error('❌ Error checking table:', tableError);
    }
    
    // Test insert a demo record
    const { data: demo, error: demoError } = await supabase
      .from('phone_numbers')
      .upsert({
        business_id: '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad',
        vapi_phone_id: 'demo_phone_id',
        phone_number: '+1-555-DEMO',
        vapi_phone_number_id: 'ph_demo123'
      }, {
        onConflict: 'vapi_phone_id'
      })
      .select();
    
    if (!demoError) {
      console.log('✅ Demo phone number record created/updated');
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

runPhoneMigration();