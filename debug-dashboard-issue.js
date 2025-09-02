#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://irvyhhkoiyzartmmvbxw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk');

async function debugDashboard() {
  console.log('🔍 Dashboard Debug Investigation...');
  
  // Check Eric's appointment details
  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      id, 
      business_id, 
      appointment_date,
      start_time,
      customers(first_name, phone)
    `)
    .eq('customers.phone', '3232837135')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  if (appointment) {
    console.log('📅 Eric\'s appointment details:');
    console.log('   Business ID:', appointment.business_id);
    console.log('   Date:', appointment.appointment_date);
    console.log('   Time:', appointment.start_time);
    console.log('   Customer:', appointment.customers.first_name, appointment.customers.phone);
  }
  
  // Check what the dashboard should be looking for
  const bellaId = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971';
  console.log('\n🏢 Expected Dashboard Business ID:', bellaId);
  console.log('✅ ID Match:', appointment?.business_id === bellaId ? 'YES' : 'NO');
  
  // Check if dashboard query would find this appointment
  const { data: dashboardAppointments } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      start_time,
      status,
      customers(first_name, last_name, phone),
      services(name, base_price)
    `)
    .eq('business_id', bellaId)
    .order('created_at', { ascending: false });
    
  console.log(`\n📊 Dashboard query results: ${dashboardAppointments?.length || 0} appointments`);
  
  if (dashboardAppointments && dashboardAppointments.length > 0) {
    console.log('   Appointments found:');
    dashboardAppointments.forEach((apt, i) => {
      console.log(`   ${i + 1}. ${apt.customers?.first_name} - ${apt.appointment_date} ${apt.start_time} (${apt.status})`);
    });
  } else {
    console.log('   ❌ No appointments found for Bella\'s business ID');
  }
  
  // Check dashboard getUpcomingAppointments equivalent
  const today = new Date().toISOString().split('T')[0];
  const { data: upcomingAppointments } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      start_time,
      status,
      customers!inner(first_name, last_name, phone),
      services(name, base_price)
    `)
    .eq('business_id', bellaId)
    .gte('appointment_date', today)
    .order('appointment_date', { ascending: true })
    .order('start_time', { ascending: true })
    .limit(5);
    
  console.log(`\n📅 Upcoming appointments query: ${upcomingAppointments?.length || 0} results`);
  if (upcomingAppointments && upcomingAppointments.length > 0) {
    upcomingAppointments.forEach((apt, i) => {
      console.log(`   ${i + 1}. ${apt.customers?.first_name} - ${apt.appointment_date} ${apt.start_time}`);
    });
  }
  
  console.log('\n📅 Date Analysis:');
  console.log('   Today:', today);
  console.log('   Appointment date:', appointment?.appointment_date);
  console.log('   Is appointment in past?:', appointment?.appointment_date < today ? 'YES' : 'NO');
}

debugDashboard();