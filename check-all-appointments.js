const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://irvyhhkoiyzartmmvbxw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk';

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllAppointments() {
  console.log('🔍 Checking all appointments in Supabase...\n');
  
  try {
    // 1. Get all appointments with related data
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customer:customers(first_name, last_name, email, phone),
        service:services(name, duration_minutes, base_price),
        staff:staff(first_name, last_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching appointments:', error);
      return;
    }
    
    console.log(`📊 Total appointments found: ${appointments?.length || 0}\n`);
    
    // 2. Group appointments by business_id
    const appointmentsByBusiness = {};
    appointments?.forEach(apt => {
      if (!appointmentsByBusiness[apt.business_id]) {
        appointmentsByBusiness[apt.business_id] = [];
      }
      appointmentsByBusiness[apt.business_id].push(apt);
    });
    
    // 3. Get business names for better display
    const businessIds = Object.keys(appointmentsByBusiness);
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name')
      .in('id', businessIds);
    
    const businessMap = {};
    businesses?.forEach(b => {
      businessMap[b.id] = b.name;
    });
    
    // 4. Display appointments grouped by business
    console.log('📋 Appointments by Business:\n');
    console.log('=' .repeat(80));
    
    for (const [businessId, businessAppointments] of Object.entries(appointmentsByBusiness)) {
      const businessName = businessMap[businessId] || 'Unknown Business';
      console.log(`\n🏢 ${businessName} (ID: ${businessId})`);
      console.log(`   Total appointments: ${businessAppointments.length}`);
      console.log('-'.repeat(80));
      
      businessAppointments.forEach((apt, index) => {
        const customerName = apt.customer 
          ? `${apt.customer.first_name} ${apt.customer.last_name}`
          : 'Unknown Customer';
        const serviceName = apt.service?.name || 'Unknown Service';
        const staffName = apt.staff 
          ? `${apt.staff.first_name} ${apt.staff.last_name}`
          : 'No staff assigned';
        
        console.log(`\n   ${index + 1}. Appointment ID: ${apt.id}`);
        console.log(`      📅 Date: ${apt.appointment_date} at ${apt.start_time}`);
        console.log(`      👤 Customer: ${customerName}`);
        console.log(`      📞 Phone: ${apt.customer?.phone || 'No phone'}`);
        console.log(`      💅 Service: ${serviceName}`);
        console.log(`      👩‍💼 Staff: ${staffName}`);
        console.log(`      📊 Status: ${apt.status}`);
        console.log(`      ⏰ Created: ${new Date(apt.created_at).toLocaleString()}`);
      });
    }
    
    // 5. Special check for Bella's Nails Studio
    console.log('\n' + '='.repeat(80));
    console.log('🔍 Special Focus: Bella\'s Nails Studio\n');
    
    const bellasId = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971';
    const bellasAppointments = appointmentsByBusiness[bellasId] || [];
    
    if (bellasAppointments.length > 0) {
      console.log(`✅ Found ${bellasAppointments.length} appointments for Bella's Nails Studio`);
      
      // Check for appointments created via phone/Vapi
      const phoneAppointments = bellasAppointments.filter(apt => 
        apt.notes?.includes('phone') || 
        apt.notes?.includes('Vapi') ||
        apt.created_at.includes('2025-01')
      );
      
      console.log(`📞 Appointments possibly created via phone: ${phoneAppointments.length}`);
      
      // Show recent appointments
      console.log('\n📅 Most recent appointments:');
      bellasAppointments.slice(0, 5).forEach(apt => {
        const customerName = apt.customer 
          ? `${apt.customer.first_name} ${apt.customer.last_name}`
          : 'Unknown';
        console.log(`   - ${apt.appointment_date} at ${apt.start_time}: ${customerName} (${apt.status})`);
      });
    } else {
      console.log('⚠️ No appointments found for Bella\'s Nails Studio');
      console.log('   This might indicate:');
      console.log('   1. Appointments are being created with wrong business_id');
      console.log('   2. Dashboard is looking at wrong business_id');
      console.log('   3. Phone number mapping might be incorrect');
    }
    
    // 6. Check phone number mapping
    console.log('\n' + '='.repeat(80));
    console.log('📞 Checking Phone Number Mappings:\n');
    
    const { data: phoneMappings, error: phoneError } = await supabase
      .from('phone_business_mapping')
      .select('*');
    
    if (phoneError) {
      console.error('❌ Error fetching phone mappings:', phoneError);
    } else if (phoneMappings && phoneMappings.length > 0) {
      console.log('Phone mappings found:');
      phoneMappings.forEach(mapping => {
        const businessName = businessMap[mapping.business_id] || 'Unknown';
        console.log(`   📱 ${mapping.phone_number} → ${businessName} (${mapping.business_id})`);
      });
    } else {
      console.log('⚠️ No phone mappings found in database');
    }
    
    // 7. Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY:\n');
    console.log(`Total appointments in database: ${appointments?.length || 0}`);
    console.log(`Total businesses with appointments: ${businessIds.length}`);
    console.log(`Bella's Nails Studio appointments: ${bellasAppointments.length}`);
    
    if (bellasAppointments.length === 0) {
      console.log('\n⚠️ ACTION NEEDED:');
      console.log('1. Check webhook server logs to see if appointments are being created');
      console.log('2. Verify phone number mapping is correct');
      console.log('3. Check if business_id is being set correctly in webhook');
      console.log('4. Test creating an appointment via phone call to verify');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkAllAppointments();