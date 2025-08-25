// Check appointments table schema
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkAppointmentsSchema() {
  console.log('🔍 Checking appointments table schema...\n');
  
  try {
    // Try to get one appointment to see the schema
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error querying appointments:', error.message);
      return;
    }
    
    if (appointments && appointments.length > 0) {
      const appointment = appointments[0];
      console.log('✅ Appointments table schema:');
      Object.keys(appointment).forEach(key => {
        console.log(`   ${key}: ${typeof appointment[key]} = ${appointment[key]}`);
      });
    } else {
      console.log('⚠️  No appointments found in table');
      
      // Try to insert a test appointment to see what columns are available
      console.log('\nTrying to find table structure by testing insert...');
      
      const testData = {
        business_id: '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad',
        customer_name: 'Schema Test',
        customer_phone: '555-SCHEMA',
        appointment_date: '2025-08-27',
        start_time: '10:00',
        status: 'scheduled',
        booking_source: 'test'
      };
      
      const { data: insertTest, error: insertError } = await supabase
        .from('appointments')
        .insert(testData)
        .select()
        .single();
      
      if (insertError) {
        console.log('❌ Insert test error:', insertError.message);
        console.log('   Details:', insertError);
      } else {
        console.log('✅ Insert successful - Available columns:');
        Object.keys(insertTest).forEach(key => {
          console.log(`   ${key}: ${typeof insertTest[key]} = ${insertTest[key]}`);
        });
      }
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

checkAppointmentsSchema();