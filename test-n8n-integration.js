#!/usr/bin/env node

/**
 * N8N Integration Test Script
 * Tests the post-booking workflow by simulating an appointment booking
 */

require('dotenv').config();
const fetch = require('node-fetch');

async function testN8NIntegration() {
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
    
    if (!N8N_WEBHOOK_URL) {
        console.error('❌ N8N_WEBHOOK_URL not configured in environment variables');
        console.log('Please add N8N_WEBHOOK_URL to your .env file');
        process.exit(1);
    }
    
    if (N8N_WEBHOOK_URL.includes('your-n8n-instance.com')) {
        console.error('❌ N8N_WEBHOOK_URL still contains placeholder URL');
        console.log('Please update N8N_WEBHOOK_URL in your .env file with your actual N8N webhook URL');
        process.exit(1);
    }
    
    console.log('🧪 Testing N8N Post-Booking Integration...');
    console.log('📡 N8N Webhook URL:', N8N_WEBHOOK_URL);
    
    // Sample booking data that matches our webhook payload structure
    const testBookingData = {
        event: 'appointment_booked',
        timestamp: new Date().toISOString(),
        business: {
            id: '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad',
            name: 'Test Nail Salon',
            email: 'info@testsalon.com',
            phone: '+1-555-123-4567',
            address: '123 Beauty Street',
            city: 'Los Angeles',
            state: 'CA'
        },
        appointment: {
            id: 'test-apt-' + Date.now(),
            date: '2024-08-30',
            time: '14:00',
            endTime: '15:00',
            duration: 60,
            status: 'scheduled',
            source: 'phone',
            notes: 'Test booking via N8N integration'
        },
        customer: {
            id: 'test-customer-' + Date.now(),
            name: 'Jane Test',
            firstName: 'Jane',
            lastName: 'Test',
            phone: '+1-555-987-6543',
            email: 'jane.test@example.com',
            totalVisits: 1,
            totalSpent: 0
        },
        service: {
            id: 'test-service-' + Date.now(),
            name: 'Gel Manicure',
            category: 'nails',
            duration: 60,
            price: 5000
        }
    };
    
    try {
        console.log('🔄 Sending test booking data to N8N...');
        
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testBookingData)
        });
        
        console.log('📊 Response Status:', response.status, response.statusText);
        
        if (response.ok) {
            const result = await response.text();
            console.log('✅ N8N Webhook Response:', result);
            console.log('');
            console.log('🎉 SUCCESS! N8N integration is working correctly.');
            console.log('');
            console.log('📋 Next Steps:');
            console.log('1. Check your N8N workflow execution log');
            console.log('2. Verify test SMS/email were sent (if configured)');
            console.log('3. Check test calendar event was created (if configured)');
            console.log('4. Make a real booking to test end-to-end flow');
            
        } else {
            console.error('❌ N8N Webhook Error:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error details:', errorText);
            
            console.log('');
            console.log('🔧 Troubleshooting Tips:');
            console.log('1. Verify N8N workflow is active');
            console.log('2. Check N8N webhook URL is correct');
            console.log('3. Ensure N8N instance is accessible');
            console.log('4. Check N8N workflow logs for errors');
        }
        
    } catch (error) {
        console.error('❌ Network Error:', error.message);
        console.log('');
        console.log('🔧 Troubleshooting Tips:');
        console.log('1. Check your internet connection');
        console.log('2. Verify N8N_WEBHOOK_URL is correct');
        console.log('3. Ensure N8N instance is running');
        console.log('4. Check for firewall or network restrictions');
    }
}

// Run the test
testN8NIntegration();