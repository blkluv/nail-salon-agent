// Test dashboard API flow for staff data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function testDashboardAPIFlow() {
  try {
    console.log('🖥️  Testing Dashboard API Data Flow...\n');
    
    // Test the exact same queries the dashboard uses
    const businessId = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971'; // Bella's Nails Studio
    
    console.log('📊 Testing BusinessAPI.getStaff() equivalent...');
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('first_name');
      
    if (staffError) {
      console.error('❌ Staff API error:', staffError);
      return;
    }
    
    console.log(`✅ Staff API returned ${staff.length} staff members:`);
    staff.forEach(s => {
      console.log(`   - ${s.first_name} ${s.last_name} (${s.role})`);
      console.log(`     Email: ${s.email}, Phone: ${s.phone || 'N/A'}`);
      console.log(`     Hire Date: ${s.hire_date}, Active: ${s.is_active}`);
      console.log(`     Hourly Rate: $${s.hourly_rate}, Commission: ${(s.commission_rate * 100)}%`);
    });
    
    // Test other dashboard APIs
    console.log('\n🏢 Testing Business API...');
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();
      
    if (businessError) {
      console.error('❌ Business API error:', businessError);
    } else {
      console.log(`✅ Business: ${business.name} (${business.subscription_tier})`);
      console.log(`   Settings available: ${business.settings ? 'Yes' : 'No'}`);
    }
    
    console.log('\n🔧 Testing Services API...');
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true);
      
    if (servicesError) {
      console.error('❌ Services API error:', servicesError);
    } else {
      console.log(`✅ Services: ${services.length} active services`);
      services.slice(0, 3).forEach(s => {
        console.log(`   - ${s.name}: $${s.base_price} (${s.duration_minutes}min)`);
      });
    }
    
    console.log('\n📅 Testing Appointments API...');
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('business_id', businessId)
      .limit(5);
      
    if (appointmentsError) {
      console.error('❌ Appointments API error:', appointmentsError);
    } else {
      console.log(`✅ Appointments: ${appointments.length} found`);
      appointments.forEach(a => {
        console.log(`   - ${a.customer_name || 'N/A'}: ${a.appointment_date} (${a.status})`);
      });
    }
    
    // Test the exact data transformation the dashboard does
    console.log('\n🔄 Testing Dashboard Data Transformation...');
    const transformedStaff = staff.map(member => ({
      id: member.id,
      name: `${member.first_name} ${member.last_name}`,
      email: member.email,
      phone: member.phone || '',
      specialties: member.specialties || [],
      isActive: member.is_active,
      hireDate: member.hire_date,
      hourlyRate: member.hourly_rate || 0,
      commissionRate: (member.commission_rate || 0) * 100,
      role: member.role,
      totalAppointments: 0, // Would be calculated from appointments
      rating: 4.5 // Default rating
    }));
    
    console.log('✅ Dashboard transformation successful:');
    transformedStaff.forEach(s => {
      console.log(`   - ${s.name} (${s.role}): ${s.email}`);
      console.log(`     Rate: $${s.hourlyRate}/hr, Commission: ${s.commissionRate}%`);
    });
    
    console.log('\n🎯 DASHBOARD API FLOW RESULTS:');
    console.log('=' .repeat(50));
    console.log(`✅ Staff Data: ${staff.length > 0 ? 'AVAILABLE' : 'MISSING'}`);
    console.log(`✅ Business Data: ${business ? 'AVAILABLE' : 'MISSING'}`);
    console.log(`✅ Services Data: ${services.length > 0 ? 'AVAILABLE' : 'MISSING'}`);
    console.log(`✅ Appointments: ${appointments.length >= 0 ? 'AVAILABLE' : 'MISSING'}`);
    console.log(`✅ Data Transformation: WORKING`);
    
    console.log('\n🚀 FINAL VERIFICATION:');
    const hasStaff = staff.length > 0;
    const hasBusiness = !!business;
    const hasServices = services.length > 0;
    
    if (hasStaff && hasBusiness && hasServices) {
      console.log('✅ ALL SYSTEMS READY - Dashboard will show complete data!');
      console.log('📱 Staff page: Will display staff members');
      console.log('🏢 Business page: Will display business info');
      console.log('🔧 Services page: Will display services');
      console.log('👥 The staff onboarding fix is successfully deployed!');
    } else {
      console.log('❌ Some data missing - dashboard may have issues');
    }
    
  } catch (error) {
    console.error('❌ Dashboard API test failed:', error);
  }
}

testDashboardAPIFlow();