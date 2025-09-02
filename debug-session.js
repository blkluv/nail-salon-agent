#!/usr/bin/env node

const axios = require('axios');

const WEBHOOK_URL = 'https://web-production-60875.up.railway.app';

async function debugSession() {
    console.log('🔍 Debugging Session Structure...');
    
    try {
        // Step 1: Login to get session token
        console.log('\n🔐 Step 1: Login...');
        const loginResponse = await axios.post(`${WEBHOOK_URL}/api/customer/auth/login`, {
            businessId: 'bb18c6ca-7e97-449d-8245-e3c28a6b6971',
            phoneNumber: '3232837135',
            lastName: 'Scott'
        });
        
        const sessionToken = loginResponse.data.sessionToken;
        console.log('✅ Login successful');
        
        // Step 2: Debug session structure
        console.log('\n🔍 Step 2: Debug session structure...');
        
        try {
            const debugResponse = await axios.post(`${WEBHOOK_URL}/api/customer/auth/debug-session`, {
                sessionToken: sessionToken
            });
            
            console.log('✅ Session debug success:');
            console.log(JSON.stringify(debugResponse.data, null, 2));
            
        } catch (error) {
            console.log('❌ Session debug failed:', error.response?.data || error.message);
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugSession();