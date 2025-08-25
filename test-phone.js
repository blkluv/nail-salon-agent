#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

async function testPhoneProvisioning() {
    console.log('🧪 Testing Vapi Phone Number Provisioning...\n');
    
    const apiKey = process.env.VAPI_API_KEY;
    if (!apiKey) {
        console.log('❌ VAPI_API_KEY not found in environment');
        return;
    }
    
    try {
        const phoneRequest = {
            provider: 'twilio',
            areaCode: '310'
        };

        console.log('📞 Requesting phone number...');
        const response = await axios.post('https://api.vapi.ai/phone-number', phoneRequest, {
            headers: { 
                'Authorization': `Bearer ${apiKey}`, 
                'Content-Type': 'application/json' 
            }
        });
        
        console.log('✅ Success! Phone number:', response.data.number);
        console.log('📋 Phone ID:', response.data.id);
        console.log('\n🎉 Phone provisioning test PASSED!');
        
        return response.data;
    } catch (error) {
        console.log('❌ Phone provisioning failed:', error.response?.data?.message || error.message);
        console.log('\n📝 This is expected if you don\'t have phone number credits in Vapi');
        return null;
    }
}

testPhoneProvisioning();