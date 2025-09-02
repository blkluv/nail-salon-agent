#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = 'https://irvyhhkoiyzartmmvbxw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkAppointmentMismatch() {
    try {
        console.log('🔍 Checking for appointment/business ID mismatch...');
        
        // Get all businesses
        const { data: businesses } = await supabase
            .from('businesses')
            .select('id, name, created_at')
            .order('created_at', { ascending: false });
            
        console.log('\n📋 All Businesses:');
        businesses.forEach((b, i) => {
            console.log(`${i + 1}. ${b.name} (${b.id}) - Created: ${b.created_at}`);
        });
        
        // Get appointments from last 2 hours
        const { data: recentAppointments } = await supabase
            .from('appointments')
            .select(`
                id, business_id, created_at, appointment_date, start_time,
                customers(first_name, last_name, phone),
                services(name, base_price),
                businesses(name)
            `)
            .gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false });
            
        console.log('\n📅 Recent Appointments (last 2 hours):');
        if (recentAppointments && recentAppointments.length > 0) {
            recentAppointments.forEach((apt, i) => {
                console.log(`${i + 1}. Customer: ${apt.customers?.first_name || 'Unknown'} ${apt.customers?.last_name || ''}`);
                console.log(`   Service: ${apt.services?.name || 'Unknown'} ($${apt.services?.base_price || 'N/A'})`);
                console.log(`   Business: ${apt.businesses?.name || 'Unknown'} (${apt.business_id})`);
                console.log(`   Date/Time: ${apt.appointment_date} ${apt.start_time}`);
                console.log(`   Created: ${apt.created_at}`);
                console.log('');
            });
        } else {
            console.log('   No appointments found in the last 2 hours');
        }
        
        // Get recent customers
        const { data: recentCustomers } = await supabase
            .from('customers')
            .select('id, first_name, last_name, phone, business_id, created_at')
            .gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false });
            
        console.log('\n👤 Recent Customers (last 2 hours):');
        if (recentCustomers && recentCustomers.length > 0) {
            recentCustomers.forEach((customer, i) => {
                const business = businesses.find(b => b.id === customer.business_id);
                console.log(`${i + 1}. ${customer.first_name} ${customer.last_name} - ${customer.phone}`);
                console.log(`   Business: ${business?.name || 'Unknown'} (${customer.business_id})`);
                console.log(`   Created: ${customer.created_at}`);
                console.log('');
            });
        } else {
            console.log('   No customers created in the last 2 hours');
        }
        
        // Check what business ID the webhook should be using
        const latestBusiness = businesses[0];
        console.log(`\n🎯 Webhook should be using: ${latestBusiness.name} (${latestBusiness.id})`);
        console.log(`📱 Dashboard demo ID: 8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad`);
        console.log(`🏢 Bella's Nails ID: bb18c6ca-7e97-449d-8245-e3c28a6b6971`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkAppointmentMismatch();