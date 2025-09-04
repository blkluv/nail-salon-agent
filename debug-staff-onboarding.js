// Debug script to simulate staff collection during onboarding
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Simulate typical staff data from onboarding form
const mockStaffData = [
  {
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah@test.com',
    phone: '555-123-4567',
    role: 'owner'
  },
  {
    first_name: 'Maria',
    last_name: 'Garcia',
    email: 'maria@test.com',
    phone: '555-234-5678',
    role: 'technician'
  },
  {
    first_name: '',  // Invalid - missing first name
    last_name: 'Smith',
    email: 'smith@test.com',
    phone: '555-345-6789',
    role: 'technician'
  }
];

async function debugStaffProcess() {
  try {
    console.log('🧪 Testing staff onboarding process...\n');
    
    console.log('📋 Mock staff data from onboarding form:');
    mockStaffData.forEach((staff, index) => {
      console.log(`   ${index + 1}. ${staff.first_name} ${staff.last_name} (${staff.role}) - ${staff.email}`);
    });
    
    // Apply the same filter used in onboarding
    const validStaff = mockStaffData.filter(s => s.first_name && s.last_name);
    
    console.log(`\n✅ Valid staff after filtering (${validStaff.length}/${mockStaffData.length}):`);
    validStaff.forEach((staff, index) => {
      console.log(`   ${index + 1}. ${staff.first_name} ${staff.last_name} (${staff.role})`);
    });
    
    if (validStaff.length === 0) {
      console.log('\n❌ PROBLEM: No valid staff would be inserted!');
      return;
    }
    
    // Test what would be inserted into database
    console.log('\n💾 Database insertion payload:');
    const insertPayload = validStaff.map(member => ({
      business_id: 'test-business-id',
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email || '',
      phone: member.phone || '',
      role: member.role,
      specialties: member.role === 'technician' ? ['Manicures', 'Pedicures'] : [],
      hourly_rate: member.role === 'technician' ? 25 : member.role === 'manager' ? 30 : 35,
      commission_rate: member.role === 'technician' ? 0.4 : member.role === 'manager' ? 0.3 : 0.2,
      is_active: true,
      hire_date: new Date().toISOString().split('T')[0]
    }));
    
    console.log(JSON.stringify(insertPayload, null, 2));
    
    // Test actual database insertion with a test business
    console.log('\n🔬 Testing actual database insertion...');
    
    // First, get a real business ID to test with
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name')
      .limit(1);
      
    if (!businesses || businesses.length === 0) {
      console.log('❌ No businesses found to test with');
      return;
    }
    
    const testBusinessId = businesses[0].id;
    console.log(`   Using business: ${businesses[0].name} (${testBusinessId})`);
    
    // Insert test staff with unique names to avoid conflicts
    const testStaffPayload = validStaff.map(member => ({
      business_id: testBusinessId,
      first_name: `TEST_${member.first_name}`,
      last_name: `TEST_${member.last_name}`,
      email: `test_${member.email}`,
      phone: member.phone || '',
      role: member.role,
      specialties: member.role === 'technician' ? ['Test Service'] : [],
      hourly_rate: 25,
      commission_rate: 0.4,
      is_active: true,
      hire_date: new Date().toISOString().split('T')[0]
    }));
    
    const { data: insertedStaff, error: staffError } = await supabase
      .from('staff')
      .insert(testStaffPayload)
      .select();
    
    if (staffError) {
      console.log('❌ Staff insertion failed:');
      console.log('   Error:', staffError);
      console.log('   Payload:', JSON.stringify(testStaffPayload, null, 2));
    } else {
      console.log(`✅ Successfully inserted ${insertedStaff.length} staff members`);
      insertedStaff.forEach(s => {
        console.log(`   - ${s.first_name} ${s.last_name} (${s.role})`);
      });
      
      // Clean up test data
      console.log('\n🧹 Cleaning up test data...');
      const { error: deleteError } = await supabase
        .from('staff')
        .delete()
        .in('id', insertedStaff.map(s => s.id));
        
      if (deleteError) {
        console.log('⚠️  Warning: Could not clean up test data:', deleteError);
      } else {
        console.log('✅ Test data cleaned up');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugStaffProcess();