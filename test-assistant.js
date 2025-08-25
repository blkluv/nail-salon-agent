#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

async function testAssistantCreation() {
    console.log('🧪 Testing Vapi Assistant Creation...\n');
    
    const apiKey = process.env.VAPI_API_KEY;
    if (!apiKey) {
        console.log('❌ VAPI_API_KEY not found in environment');
        return;
    }
    
    try {
        const testSalon = {
            name: `Test Salon ${Date.now()}`,
            city: 'Los Angeles',
            state: 'CA'
        };

        // Create a simple test assistant
        const assistantConfig = {
            name: `${testSalon.name} Receptionist`,
            model: {
                provider: "openai",
                model: "gpt-4o",
                messages: [{
                    role: "system",
                    content: `You are the virtual receptionist for ${testSalon.name}, a nail salon in ${testSalon.city}, ${testSalon.state}. Help customers with booking appointments.`
                }]
            },
            voice: {
                provider: "11labs",
                voiceId: "sarah"
            },
            transcriber: {
                provider: "deepgram", 
                model: "nova-3"
            },
            firstMessage: `Hi! Welcome to ${testSalon.name}! How can I help you today?`
        };

        console.log('🤖 Creating test assistant...');
        const response = await axios.post('https://api.vapi.ai/assistant', assistantConfig, {
            headers: { 
                'Authorization': `Bearer ${apiKey}`, 
                'Content-Type': 'application/json' 
            }
        });
        
        console.log('✅ Success! Assistant created');
        console.log('📋 Assistant ID:', response.data.id);
        console.log('📝 Assistant Name:', response.data.name);
        
        // Clean up - delete the test assistant
        console.log('🧹 Cleaning up test assistant...');
        await axios.delete(`https://api.vapi.ai/assistant/${response.data.id}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        
        console.log('✅ Test assistant deleted');
        console.log('\n🎉 Assistant creation test PASSED!');
        
        return response.data;
    } catch (error) {
        console.log('❌ Assistant creation failed:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.log('📝 Full error:', JSON.stringify(error.response.data, null, 2));
        }
        return null;
    }
}

testAssistantCreation();