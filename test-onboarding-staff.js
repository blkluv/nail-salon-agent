// Test script to manually add staff to existing business
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function addTestStaff() {
  try {
    console.log('🧪 Adding test staff to existing business...\n');
    
    // Get Bella's Nails Studio for testing
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('name', "Bella's Nails Studio")
      .limit(1);
      
    if (!businesses || businesses.length === 0) {
      console.log('❌ Bella\'s Nails Studio not found');
      return;
    }
    
    const businessId = businesses[0].id;
    console.log(`📍 Using business: ${businesses[0].name} (${businessId})`);
    
    // Add some realistic staff members
    const staffToAdd = [
      {
        business_id: businessId,
        first_name: 'Isabella',
        last_name: 'Rodriguez',
        email: 'isabella@bellasnails.com',
        phone: '555-123-4567',
        role: 'owner',
        specialties: ['Business Management'],
        hourly_rate: 35,
        commission_rate: 0.2,
        is_active: true,
        hire_date: '2023-01-15'
      },
      {
        business_id: businessId,
        first_name: 'Maria',
        last_name: 'Santos',
        email: 'maria@bellasnails.com',
        phone: '555-234-5678',
        role: 'technician',
        specialties: ['Manicures', 'Pedicures', 'Gel Extensions'],
        hourly_rate: 25,
        commission_rate: 0.4,
        is_active: true,
        hire_date: '2023-03-20'
      },
      {
        business_id: businessId,
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah@bellasnails.com',
        phone: '555-345-6789',
        role: 'technician',
        specialties: ['Nail Art', 'Acrylics', 'Spa Services'],
        hourly_rate: 27,
        commission_rate: 0.45,
        is_active: true,
        hire_date: '2023-02-10'
      }
    ];
    
    console.log(`👥 Adding ${staffToAdd.length} staff members:`);
    staffToAdd.forEach((s, index) => {
      console.log(`   ${index + 1}. ${s.first_name} ${s.last_name} (${s.role})`);
    });
    
    const { data: insertedStaff, error: staffError } = await supabase
      .from('staff')
      .insert(staffToAdd)
      .select();
    
    if (staffError) {
      console.log('❌ Staff insertion failed:', staffError);
    } else {
      console.log(`✅ Successfully inserted ${insertedStaff.length} staff members!`);
      console.log('\n📊 Staff added:');
      insertedStaff.forEach(s => {
        console.log(`   - ${s.first_name} ${s.last_name} (${s.role}) - ${s.email}`);
      });
      
      console.log('\n✨ Now check the dashboard at: /dashboard/staff');
      console.log('   The staff should now appear in Bella\'s Nails Studio dashboard!');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addTestStaff();