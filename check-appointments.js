#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://irvyhhkoiyzartmmvbxw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk');

async function checkAppointments() {
    console.log('🔍 Checking appointments in Supabase...');
    
    // Check for Bella's business appointments
    const { data: bellaAppointments, error: bellaError } = await supabase
        .from('appointments')
        .select(`
            *,
            customers(*),
            services(*),
            staff(*)
        `)
        .eq('business_id', 'bb18c6ca-7e97-449d-8245-e3c28a6b6971')
        .order('appointment_date', { ascending: true });
        
    console.log('📅 Bella\'s Nails Appointments:', bellaAppointments?.length || 0);
    if (bellaAppointments?.length > 0) {
        bellaAppointments.forEach((apt, i) => {
            console.log(`   ${i + 1}. ${apt.customers?.first_name || 'Unknown'} ${apt.customers?.last_name || ''} - ${apt.appointment_date} ${apt.start_time} (${apt.status})`);
        });
    }
    
    // Check for demo business appointments
    const { data: demoAppointments, error: demoError } = await supabase
        .from('appointments')
        .select(`
            *,
            customers(*),
            services(*),
            staff(*)
        `)
        .eq('business_id', '00000000-0000-0000-0000-000000000000')
        .order('appointment_date', { ascending: true });
        
    console.log('\n📅 Demo Business Appointments:', demoAppointments?.length || 0);
    if (demoAppointments?.length > 0) {
        demoAppointments.forEach((apt, i) => {
            console.log(`   ${i + 1}. ${apt.customers?.first_name || 'Unknown'} ${apt.customers?.last_name || ''} - ${apt.appointment_date} ${apt.start_time} (${apt.status})`);
        });
    }
    
    if (bellaError) console.log('❌ Bella Error:', bellaError);
    if (demoError) console.log('❌ Demo Error:', demoError);
}

checkAppointments();