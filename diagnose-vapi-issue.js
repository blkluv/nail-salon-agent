#!/usr/bin/env node

/**
 * 🔍 Diagnose Vapi Provider Configuration Issue
 * 
 * Error: {"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
 */

require('dotenv').config();

const VAPI_API_KEY = process.env.VAPI_API_KEY;

async function diagnoseVapiIssue() {
  console.log('🔍 Diagnosing Vapi Provider Configuration Issue...');
  console.log();
  console.log('❌ Error Context: "Unsupported provider: provider is not enabled"');
  console.log();

  if (!VAPI_API_KEY) {
    console.log('❌ VAPI_API_KEY not found in environment variables');
    return;
  }

  console.log('🔑 Using API Key:', VAPI_API_KEY.substring(0, 8) + '...');
  console.log();

  try {
    // Test 1: Basic API Authentication
    console.log('📊 Test 1: Basic API Authentication...');
    const authResponse = await fetch('https://api.vapi.ai/assistant', {
      headers: { 'Authorization': `Bearer ${VAPI_API_KEY}` }
    });
    
    console.log('   Status:', authResponse.status);
    
    if (authResponse.status === 401) {
      console.log('❌ CRITICAL: API Key is invalid or expired');
      console.log('   Action Required: Check Vapi dashboard for correct API key');
      return;
    } else if (authResponse.status === 402) {
      console.log('💳 BILLING ISSUE: Payment method required');
      console.log('   Action Required: Add payment method to Vapi account');
      return;
    } else if (authResponse.status === 200) {
      console.log('✅ API Key is valid and working');
    }

    // Test 2: Check Account Settings
    console.log();
    console.log('🏢 Test 2: Checking Account Configuration...');
    
    // Get existing phone numbers to see what providers are enabled
    const phonesResponse = await fetch('https://api.vapi.ai/phone-number', {
      headers: { 'Authorization': `Bearer ${VAPI_API_KEY}` }
    });
    
    if (phonesResponse.ok) {
      const phones = await phonesResponse.json();
      console.log('📱 Existing Phone Numbers:', phones.length);
      
      phones.forEach((phone, i) => {
        console.log(`   ${i+1}. ${phone.number} (Provider: ${phone.provider})`);
      });
      
      // Check what providers are actually working
      const enabledProviders = [...new Set(phones.map(p => p.provider))];
      console.log('✅ Enabled Providers:', enabledProviders.join(', '));
      
    } else {
      console.log('❌ Could not fetch phone numbers');
    }

    // Test 3: Try Different Provider Configurations
    console.log();
    console.log('🧪 Test 3: Testing Provider Configurations...');
    
    const providersToTest = ['vapi', 'twilio'];
    
    for (const provider of providersToTest) {
      console.log(`   Testing provider: ${provider}...`);
      
      const testPayload = {
        provider: provider,
        name: `Test ${provider} Phone`
      };
      
      const testResponse = await fetch('https://api.vapi.ai/phone-number', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });
      
      console.log(`   ${provider} Status:`, testResponse.status);
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.log(`   ${provider} Error:`, errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.msg && errorJson.msg.includes('provider is not enabled')) {
            console.log(`   ❌ ${provider.toUpperCase()} provider is NOT enabled in your Vapi account`);
          }
        } catch (e) {
          // Not JSON error
        }
      } else {
        console.log(`   ✅ ${provider.toUpperCase()} provider is working`);
        
        // Clean up test phone number
        const phoneData = await testResponse.json();
        if (phoneData.id) {
          await fetch(`https://api.vapi.ai/phone-number/${phoneData.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${VAPI_API_KEY}` }
          });
          console.log(`   🧹 Cleaned up test ${provider} phone number`);
        }
        break; // Found working provider
      }
    }

    console.log();
    console.log('🎯 DIAGNOSIS SUMMARY:');
    console.log();
    
    console.log('📋 MOST LIKELY ISSUES:');
    console.log('1. Vapi provider needs to be enabled in your Vapi account settings');
    console.log('2. Twilio integration may need to be configured in Vapi dashboard'); 
    console.log('3. Account may need billing setup to enable phone provisioning');
    console.log();
    
    console.log('🔧 RECOMMENDED ACTIONS:');
    console.log('1. Login to Vapi dashboard: https://dashboard.vapi.ai');
    console.log('2. Check "Phone Numbers" section for provider settings');
    console.log('3. Verify billing/payment method is configured');
    console.log('4. Enable required providers (Vapi or Twilio)');
    console.log();
    
    console.log('🚀 IMMEDIATE WORKAROUND:');
    console.log('Use existing phone numbers for testing while configuring providers:');
    console.log('- +14243841039 (available for immediate testing)');
    console.log('- +14243519304 (available for immediate testing)');

  } catch (error) {
    console.log();
    console.log('❌ DIAGNOSIS ERROR:', error.message);
    console.log();
    console.log('🔧 BASIC TROUBLESHOOTING:');
    console.log('1. Check internet connection');
    console.log('2. Verify API key is correct');
    console.log('3. Check Vapi service status');
  }
}

diagnoseVapiIssue();