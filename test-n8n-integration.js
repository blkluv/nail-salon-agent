#!/usr/bin/env node

/**
 * N8N Integration Test Script - Multi-Tenant Version
 * Tests the post-booking workflow with real appointment data
 */

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://irvyhhkoiyzartmmvbxw.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk'
);

async function testN8NIntegration() {
    console.log('🧪 Testing N8N Post-Booking Integration with Real Data...');
    
    try {
        // Step 1: Get real appointment data from Supabase
        console.log('\n📅 Step 1: Fetching real appointment data...');
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
            console.log('❌ No appointments found or error:', error?.message);
            console.log('\n📝 Using sample data instead...');
            
            // Fallback to sample data
            const testBookingData = {
                event: 'appointment_booked',
                timestamp: new Date().toISOString(),
                business: {
                    id: 'bb18c6ca-7e97-449d-8245-e3c28a6b6971',
                    name: 'Bella\'s Nails Studio',
                    email: 'bella@bellasnails.com',
                    phone: '(424) 351-9304',
                    address: '123 Beauty Blvd',
                    city: 'Los Angeles',
                    state: 'CA'
                },
                appointment: {
                    id: 'test-apt-' + Date.now(),
                    date: '2025-09-03',
                    time: '14:00',
                    duration: 60,
                    status: 'pending',
                    source: 'vapi_voice_ai'
                },
                customer: {
                    id: 'test-customer-' + Date.now(),
                    name: 'Test Customer',
                    firstName: 'Test',
                    lastName: 'Customer',
                    phone: '(555) 123-4567',
                    email: 'test@example.com'
                },
                service: {
                    id: 'test-service-' + Date.now(),
                    name: 'Basic Manicure',
                    duration: 60
                }
            };
            
            return await testN8NWebhook(testBookingData);
        }
        
        console.log(`✅ Found appointment: ${appointment.customers?.first_name} ${appointment.customers?.last_name} - ${appointment.appointment_date} ${appointment.start_time}`);
        
        // Step 2: Format data for N8N workflow
        console.log('\n🔄 Step 2: Formatting data for N8N workflow...');
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
        
        return await testN8NWebhook(n8nPayload);
        
    } catch (error) {
        console.error('❌ Error fetching appointment data:', error.message);
        return false;
    }
}

async function testN8NWebhook(testBookingData) {
    console.log('\n📦 N8N Payload:', JSON.stringify(testBookingData, null, 2));
    
    // Test multiple N8N endpoint possibilities
    const n8nUrls = [
        'http://localhost:5678/webhook/booking-automation',
        'http://localhost:5678/webhook-test/booking-automation',
        'http://127.0.0.1:5678/webhook/booking-automation'
    ];
    
    console.log('\n🌐 Step 3: Testing N8N webhook endpoints...');
    
    let webhookWorking = false;
    let successfulUrl = null;
    
    for (const url of n8nUrls) {
        try {
            console.log(`🔗 Trying: ${url}`);
            
            const response = await axios.post(url, testBookingData, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`✅ Success! N8N responded (${response.status}):`, response.data);
            webhookWorking = true;
            successfulUrl = url;
            break;
            
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log(`❌ Connection refused - N8N not running on this URL`);
            } else {
                console.log(`❌ Error: ${error.message}`);
            }
        }
    }
    
    if (!webhookWorking) {
        console.log('\n⚠️  N8N Integration Test Results:');
        console.log('   • N8N server is not running or not accessible');
        console.log('   • Webhook URLs tested but none responded');
        console.log('   • Payload is formatted correctly and ready to use');
        console.log('\n📋 Next Steps:');
        console.log('   1. Install N8N: npm install -g n8n');
        console.log('   2. Start N8N: npx n8n start');
        console.log('   3. Open N8N at: http://localhost:5678');
        console.log('   4. Import the n8n-post-booking-workflow.json');
        console.log('   5. Configure credentials (Twilio, Gmail, Google Calendar)');
        console.log('   6. Activate the workflow');
        console.log('   7. Re-run this test');
        return false;
    } else {
        console.log('\n🎉 N8N Integration Test PASSED!');
        console.log(`   • N8N workflow responded successfully at: ${successfulUrl}`);
        console.log('   • Post-booking automation should have been triggered');
        console.log('   • Check N8N dashboard for execution results');
        
        // Step 4: Show how to integrate with our webhook
        console.log('\n🔧 Integration Instructions:');
        console.log('Add this code to webhook-server.js after successful booking:');
        console.log(`
// Trigger N8N post-booking workflow (add after line ~X in webhook-server.js)
const triggerN8NAutomation = async (appointmentData) => {
    try {
        const response = await axios.post('${successfulUrl}', {
            event: 'appointment_booked',
            timestamp: new Date().toISOString(),
            ...appointmentData
        });
        console.log('📨 N8N automation triggered:', response.data?.status || 'success');
    } catch (error) {
        console.log('⚠️  N8N automation failed:', error.message);
    }
};

// In bookAppointment function, add this after successful database insert:
await triggerN8NAutomation({
    appointment: appointmentResult,
    customer: customerData,
    business: businessData,
    service: serviceData
});
        `);
        return true;
    }
}

// Run the test
testN8NIntegration();