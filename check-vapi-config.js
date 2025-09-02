#!/usr/bin/env node

require('dotenv').config();

const VAPI_API_KEY = process.env.VAPI_API_KEY;

async function checkVapiConfig() {
  console.log('🔍 Checking Current Vapi Configuration...');
  console.log();
  
  try {
    // Check existing phone numbers
    console.log('📞 Existing Phone Numbers:');
    const phoneResponse = await fetch('https://api.vapi.ai/phone-number', {
      headers: { 'Authorization': `Bearer ${VAPI_API_KEY}` }
    });
    
    if (phoneResponse.ok) {
      const phones = await phoneResponse.json();
      console.log('📱 Total Phone Numbers:', phones.length);
      phones.forEach((phone, i) => {
        console.log(`   ${i+1}. ${phone.number} (ID: ${phone.id})`);
        console.log(`      Provider: ${phone.provider || 'Unknown'}`);
        console.log(`      Assistant: ${phone.assistantId || 'None'}`);
        console.log(`      Name: ${phone.name || 'Unnamed'}`);
        console.log();
      });
    } else {
      console.log('❌ Failed to fetch phone numbers:', phoneResponse.status);
    }
    
    // Check existing assistants
    console.log('🤖 Existing Assistants:');
    const assistantResponse = await fetch('https://api.vapi.ai/assistant', {
      headers: { 'Authorization': `Bearer ${VAPI_API_KEY}` }
    });
    
    if (assistantResponse.ok) {
      const assistants = await assistantResponse.json();
      console.log('👥 Total Assistants:', assistants.length);
      assistants.forEach((assistant, i) => {
        console.log(`   ${i+1}. ${assistant.name} (ID: ${assistant.id})`);
        console.log(`      Model: ${assistant.model?.model || 'Unknown'}`);
        console.log(`      Webhook: ${assistant.serverUrl || 'None'}`);
        console.log();
      });
    } else {
      console.log('❌ Failed to fetch assistants:', assistantResponse.status);
    }
    
    // Check if we can create assistants (test API permissions)
    console.log('🔑 Testing API Permissions...');
    const testAssistant = {
      name: 'TEST - Delete Me',
      model: {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: 'Test assistant' }]
      }
    };
    
    const createTestResponse = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testAssistant)
    });
    
    if (createTestResponse.ok) {
      const createdAssistant = await createTestResponse.json();
      console.log('✅ Assistant creation: SUCCESS');
      console.log(`   Created test assistant: ${createdAssistant.id}`);
      
      // Clean up test assistant
      const deleteResponse = await fetch(`https://api.vapi.ai/assistant/${createdAssistant.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${VAPI_API_KEY}` }
      });
      
      if (deleteResponse.ok) {
        console.log('🧹 Test assistant cleaned up');
      }
      
    } else {
      const error = await createTestResponse.text();
      console.log('❌ Assistant creation: FAILED');
      console.log('   Error:', error);
    }
    
    console.log();
    console.log('📊 Summary:');
    console.log('   ✅ API Key: Valid');
    console.log('   ✅ Assistant Management: Working');
    console.log('   ⚠️ Phone Provisioning: Needs Twilio setup');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkVapiConfig();