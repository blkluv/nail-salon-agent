#!/usr/bin/env node

/**
 * Test Real N8N Webhook Integration
 * Uses the actual configured webhook URL from environment
 */

require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function testRealN8N() {
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
    
    console.log('🧪 Testing REAL N8N Integration...');
    console.log('📡 N8N Webhook URL:', N8N_WEBHOOK_URL);
    
    if (!N8N_WEBHOOK_URL) {
        console.log('❌ N8N_WEBHOOK_URL not found in environment');
        return;
    }
    
    try {
        // Get real appointment data
        console.log('\n📅 Fetching real appointment data...');
        const { data: appointment, error } = await supabase
            .from('appointments')
            .select(`
                *,
                customers(*),
                services(*),
                businesses(*)
            `)
            .eq('business_id', 'bb18c6ca-7e97-449d-8245-e3c28a6b6971')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        
        if (!appointment || error) {
            console.log('❌ No appointments found:', error?.message);
            return;
        }
        
        console.log(`✅ Found: ${appointment.customers?.first_name} ${appointment.customers?.last_name} - ${appointment.appointment_date}`);
        
        // Format payload
        const n8nPayload = {
            event: 'appointment_booked',
            timestamp: new Date().toISOString(),
            appointment: {
                id: appointment.id,
                date: appointment.appointment_date,
                time: appointment.start_time,
                duration: appointment.duration_minutes || 60,
                status: appointment.status,
                source: 'vapi_voice_ai'
            },
            customer: {
                id: appointment.customers?.id,
                name: `${appointment.customers?.first_name || 'Unknown'} ${appointment.customers?.last_name || 'Customer'}`,
                firstName: appointment.customers?.first_name || 'Unknown',
                lastName: appointment.customers?.last_name || 'Customer',
                phone: appointment.customers?.phone || '(555) 123-4567',
                email: appointment.customers?.email || 'customer@example.com'
            },
            service: {
                id: appointment.services?.id || 'default-service',
                name: appointment.services?.name || 'Nail Service',
                duration: appointment.services?.duration_minutes || 60
            },
            business: {
                id: appointment.businesses?.id,
                name: appointment.businesses?.name || 'Bella\'s Nails Studio',
                phone: appointment.businesses?.phone || '(424) 351-9304',
                email: appointment.businesses?.email || 'bella@bellasnails.com',
                address: appointment.businesses?.address || '123 Beauty Blvd',
                city: appointment.businesses?.city || 'Los Angeles',
                state: appointment.businesses?.state || 'CA'
            }
        };
        
        console.log('\n🔄 Sending to configured N8N webhook...');
        console.log('📦 Payload:', JSON.stringify(n8nPayload, null, 2));
        
        const response = await axios.post(N8N_WEBHOOK_URL, n8nPayload, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Vapi-Nail-Salon-Agent/1.0'
            }
        });
        
        console.log('\n✅ N8N Response:');
        console.log('   Status:', response.status, response.statusText);
        console.log('   Data:', response.data);
        
        console.log('\n🎉 SUCCESS! Your N8N workflow is working!');
        console.log('📋 What should happen next:');
        console.log('   • Check your N8N dashboard for execution log');
        console.log('   • SMS/Email notifications should be sent');
        console.log('   • Calendar events should be created');
        console.log('   • Customer analytics should be updated');
        
    } catch (error) {
        console.log('\n❌ N8N Webhook Error:');
        console.log('   Status:', error.response?.status);
        console.log('   Message:', error.message);
        console.log('   Data:', error.response?.data);
        
        if (error.code === 'ENOTFOUND') {
            console.log('\n🔧 DNS Resolution Issue:');
            console.log('   • Check if botthentic.com is accessible');
            console.log('   • Verify the webhook endpoint exists');
        } else if (error.response?.status === 404) {
            console.log('\n🔧 Webhook Not Found:');
            console.log('   • Verify the N8N workflow is active');
            console.log('   • Check the webhook path is correct');
        } else if (error.response?.status >= 500) {
            console.log('\n🔧 Server Error:');
            console.log('   • N8N workflow may have an internal error');
            console.log('   • Check N8N logs for details');
        }
    }
}

testRealN8N();