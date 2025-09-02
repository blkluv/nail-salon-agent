#!/usr/bin/env node

const axios = require('axios');

const WEBHOOK_URL = 'https://web-production-60875.up.railway.app';

async function debugAppointments() {
    console.log('🔍 Debugging Customer Portal Appointments...');
    
    try {
        // Step 1: Login to get session token
        console.log('\n🔐 Step 1: Login...');
        const loginResponse = await axios.post(`${WEBHOOK_URL}/api/customer/auth/login`, {
            businessId: 'bb18c6ca-7e97-449d-8245-e3c28a6b6971',
            phoneNumber: '3232837135',
            lastName: 'Scott'
        });
        
        const sessionToken = loginResponse.data.sessionToken;
        console.log('✅ Login successful, token length:', sessionToken.length);
        
        // Step 2: Test direct database query (simple)
        console.log('\n📊 Step 2: Test simple appointments query...');
        
        try {
            const simpleResponse = await axios.get(`${WEBHOOK_URL}/api/customer/portal/appointments?limit=1`, {
                headers: {
                    'Authorization': `Bearer ${sessionToken}`
                }
            });
            
            console.log('✅ Simple query success:', simpleResponse.data);
            
        } catch (error) {
            console.log('❌ Simple query failed:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            
            // Check if it's a data issue or query issue
            console.log('\n🔍 Error details:', JSON.stringify(error.response?.data, null, 2));
        }
        
        // Step 3: Test with different parameters
        console.log('\n📊 Step 3: Test with status filter...');
        
        try {
            const statusResponse = await axios.get(`${WEBHOOK_URL}/api/customer/portal/appointments?status=pending&limit=1`, {
                headers: {
                    'Authorization': `Bearer ${sessionToken}`
                }
            });
            
            console.log('✅ Status filter success:', statusResponse.data);
            
        } catch (error) {
            console.log('❌ Status filter failed:', error.response?.status, error.response?.data);
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugAppointments();