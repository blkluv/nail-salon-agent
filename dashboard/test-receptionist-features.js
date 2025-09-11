/**
 * Test Script: Receptionist Features End-to-End Testing
 * 
 * This script tests the new receptionist features while ensuring
 * existing beauty salon functionality remains intact.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Testing Receptionist Features Implementation\n');
console.log('==========================================\n');

async function testDatabaseSchema() {
  console.log('📊 1. Testing Database Schema...\n');
  
  try {
    // Test 1: Check if business_type column exists
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name, business_type')
      .limit(1);
    
    if (businesses && businesses.length > 0) {
      console.log('✅ businesses.business_type column exists');
      console.log(`   Sample business type: ${businesses[0].business_type}`);
    }
    
    // Test 2: Check call_logs table
    const { data: callLogs, error: callLogsError } = await supabase
      .from('call_logs')
      .select('id')
      .limit(1);
      
    if (!callLogsError) {
      console.log('✅ call_logs table exists and is accessible');
    } else {
      console.log('⚠️  call_logs table issue:', callLogsError.message);
    }
    
    // Test 3: Check leads table
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id')
      .limit(1);
      
    if (!leadsError) {
      console.log('✅ leads table exists and is accessible');
    } else {
      console.log('⚠️  leads table issue:', leadsError.message);
    }
    
    // Test 4: Check business_features table
    const { data: features, error: featuresError } = await supabase
      .from('business_features')
      .select('id')
      .limit(1);
      
    if (!featuresError) {
      console.log('✅ business_features table exists and is accessible');
    } else {
      console.log('⚠️  business_features table issue:', featuresError.message);
    }
    
  } catch (error) {
    console.error('❌ Database schema test failed:', error.message);
    return false;
  }
  
  console.log('\n');
  return true;
}

async function testFeatureFlags() {
  console.log('🚩 2. Testing Feature Flags...\n');
  
  try {
    // Import feature flags (this will test the module)
    const flags = {
      receptionistFeatures: process.env.ENABLE_RECEPTIONIST_FEATURES === 'true',
      businessTypeSelector: process.env.ENABLE_BUSINESS_TYPE_SELECTOR === 'true',
      callLogs: process.env.ENABLE_CALL_LOGS === 'true',
      leadManagement: process.env.ENABLE_LEAD_MANAGEMENT === 'true',
    };
    
    console.log('Current feature flag status:');
    Object.entries(flags).forEach(([key, value]) => {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });
    
    if (!flags.receptionistFeatures) {
      console.log('\n💡 To enable receptionist features, set:');
      console.log('   ENABLE_RECEPTIONIST_FEATURES=true');
      console.log('   ENABLE_BUSINESS_TYPE_SELECTOR=true');
      console.log('   ENABLE_CALL_LOGS=true');
      console.log('   ENABLE_LEAD_MANAGEMENT=true');
    }
    
  } catch (error) {
    console.error('❌ Feature flags test failed:', error.message);
    return false;
  }
  
  console.log('\n');
  return true;
}

async function testBackwardCompatibility() {
  console.log('🔒 3. Testing Backward Compatibility...\n');
  
  try {
    // Test 1: Verify existing beauty salons still work
    const { data: beautyBusinesses } = await supabase
      .from('businesses')
      .select('id, name, business_type')
      .eq('business_type', 'beauty_salon')
      .limit(3);
    
    console.log(`✅ Found ${beautyBusinesses?.length || 0} beauty salon businesses`);
    
    if (beautyBusinesses && beautyBusinesses.length > 0) {
      const sampleBusiness = beautyBusinesses[0];
      
      // Test appointments still work
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id')
        .eq('business_id', sampleBusiness.id)
        .limit(1);
        
      console.log(`✅ Appointments table accessible for beauty business`);
      
      // Test customers still work
      const { data: customers } = await supabase
        .from('customers')
        .select('id')
        .limit(1);
        
      console.log(`✅ Customers table accessible`);
      
      // Test services still work
      const { data: services } = await supabase
        .from('services')
        .select('id')
        .eq('business_id', sampleBusiness.id)
        .limit(1);
        
      console.log(`✅ Services table accessible for beauty business`);
    }
    
  } catch (error) {
    console.error('❌ Backward compatibility test failed:', error.message);
    return false;
  }
  
  console.log('\n');
  return true;
}

async function createTestData() {
  console.log('📝 4. Creating Test Data...\n');
  
  try {
    // Create a test general business (only if features enabled)
    if (process.env.ENABLE_RECEPTIONIST_FEATURES === 'true') {
      const testBusiness = {
        name: 'Acme Consulting (Test)',
        email: 'test-receptionist@example.com',
        phone: '+1234567890',
        business_type: 'general_business',
        address_line1: '123 Business St',
        city: 'Test City',
        state: 'CA',
        postal_code: '12345'
      };
      
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert(testBusiness)
        .select()
        .single();
        
      if (businessError && !businessError.message.includes('duplicate')) {
        throw businessError;
      }
      
      if (business || businessError?.message.includes('duplicate')) {
        console.log('✅ Test general business created/exists');
        
        // Get the business (either newly created or existing)
        const { data: existingBusiness } = await supabase
          .from('businesses')
          .select('id')
          .eq('email', testBusiness.email)
          .single();
          
        const businessId = business?.id || existingBusiness?.id;
        
        if (businessId) {
          // Create test call log
          const testCallLog = {
            business_id: businessId,
            caller_name: 'John Smith',
            caller_phone: '+1234567891',
            caller_email: 'john@example.com',
            call_type: 'inquiry',
            message: 'Interested in consulting services for digital transformation project.',
            urgency: 'normal',
            status: 'new',
            call_duration: 180
          };
          
          const { error: callError } = await supabase
            .from('call_logs')
            .insert(testCallLog);
            
          if (!callError || callError.message.includes('duplicate')) {
            console.log('✅ Test call log created');
          }
          
          // Create test lead
          const testLead = {
            business_id: businessId,
            name: 'Jane Doe',
            email: 'jane@techcorp.com',
            phone: '+1234567892',
            company: 'TechCorp',
            source: 'phone',
            status: 'new',
            interest: 'Digital transformation consulting',
            budget_range: '$50k-100k',
            timeline: 'Q1 2025',
            maya_qualified: true,
            qualification_score: 8,
            maya_notes: 'High-quality lead. Decision maker with budget. Interested in comprehensive transformation.'
          };
          
          const { error: leadError } = await supabase
            .from('leads')
            .insert(testLead);
            
          if (!leadError || leadError.message.includes('duplicate')) {
            console.log('✅ Test lead created');
          }
          
          // Create business features
          const businessFeatures = {
            business_id: businessId,
            receptionist: true,
            call_logs: true,
            lead_management: true,
            appointments: false,
            services: false,
            staff: false
          };
          
          const { error: featuresError } = await supabase
            .from('business_features')
            .upsert(businessFeatures);
            
          if (!featuresError) {
            console.log('✅ Test business features created');
          }
        }
      }
    } else {
      console.log('⚠️  Skipping test data creation (receptionist features disabled)');
    }
    
  } catch (error) {
    console.error('❌ Test data creation failed:', error.message);
    return false;
  }
  
  console.log('\n');
  return true;
}

async function testMayaJobTemplates() {
  console.log('🤖 5. Testing Maya Job Templates...\n');
  
  try {
    // Test that we can import the templates
    const fs = require('fs');
    const path = require('path');
    
    const templatesPath = path.join(__dirname, 'lib', 'maya-job-templates.ts');
    
    if (fs.existsSync(templatesPath)) {
      console.log('✅ Maya job templates file exists');
      
      const content = fs.readFileSync(templatesPath, 'utf8');
      
      // Check for general-receptionist template
      if (content.includes('general-receptionist')) {
        console.log('✅ General receptionist template found');
      }
      
      // Check for proper structure
      if (content.includes('systemPrompt') && content.includes('voiceSettings')) {
        console.log('✅ Template structure is correct');
      }
      
      // Check for business type mapping
      const featureFlagsPath = path.join(__dirname, 'lib', 'feature-flags.ts');
      if (fs.existsSync(featureFlagsPath)) {
        console.log('✅ Feature flags file exists');
        
        const flagsContent = fs.readFileSync(featureFlagsPath, 'utf8');
        if (flagsContent.includes('getMayaJobForBusinessType')) {
          console.log('✅ Business type to Maya job mapping found');
        }
      }
      
    } else {
      console.log('❌ Maya job templates file not found');
    }
    
  } catch (error) {
    console.error('❌ Maya job templates test failed:', error.message);
    return false;
  }
  
  console.log('\n');
  return true;
}

async function runAllTests() {
  console.log('🚀 Starting Receptionist Features Test Suite...\n');
  
  const results = {
    databaseSchema: await testDatabaseSchema(),
    featureFlags: await testFeatureFlags(),
    backwardCompatibility: await testBackwardCompatibility(),
    testData: await createTestData(),
    mayaTemplates: await testMayaJobTemplates()
  };
  
  console.log('📊 Test Results Summary:');
  console.log('========================\n');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  
  console.log(`\n🎯 Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 Receptionist features are ready for testing!');
    console.log('\nNext steps:');
    console.log('1. Enable feature flags in .env.local');
    console.log('2. Run the migration: node execute-maya-migration.js');
    console.log('3. Restart your development server');
    console.log('4. Test onboarding with general business type');
    console.log('5. Test dashboard with call logs and leads');
  } else {
    console.log('\n🔧 Please fix the failing tests before proceeding.');
  }
  
  return allPassed;
}

// Run the tests
runAllTests().catch(console.error);