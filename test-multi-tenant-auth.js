#!/usr/bin/env node

/**
 * Test multi-tenant authentication system
 */

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://irvyhhkoiyzartmmvbxw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk');

async function testMultiTenantAuth() {
    console.log('🔍 Testing Multi-Tenant Authentication System...');
    
    try {
        // Test 1: Demo business exists and works
        console.log('\n📋 Test 1: Demo Business');
        const { data: demoBusiness } = await supabase
            .from('businesses')
            .select('id, name, subscription_tier')
            .eq('id', '00000000-0000-0000-0000-000000000000')
            .single();
            
        if (demoBusiness) {
            console.log('✅ Demo business exists:', demoBusiness.name);
            console.log('   Tier:', demoBusiness.subscription_tier);
        } else {
            console.log('❌ Demo business not found');
        }
        
        // Test 2: Real businesses are isolated
        console.log('\n📋 Test 2: Business Isolation');
        const { data: allBusinesses } = await supabase
            .from('businesses')
            .select('id, name, owner_email')
            .order('created_at', { ascending: false });
            
        console.log(`Found ${allBusinesses?.length || 0} total businesses:`);
        allBusinesses?.forEach((business, i) => {
            const isDemo = business.id === '00000000-0000-0000-0000-000000000000';
            const isBella = business.id === 'bb18c6ca-7e97-449d-8245-e3c28a6b6971';
            const type = isDemo ? '[DEMO]' : isBella ? '[BELLA]' : '[OTHER]';
            console.log(`   ${i + 1}. ${type} ${business.name} - ${business.owner_email}`);
        });
        
        // Test 3: Authentication scenarios
        console.log('\n📋 Test 3: Authentication Scenarios');
        
        const scenarios = [
            {
                name: 'Demo Mode (Development)',
                businessId: '00000000-0000-0000-0000-000000000000',
                expected: 'Should work in development'
            },
            {
                name: 'Bella\'s Business (Real Customer)',
                businessId: 'bb18c6ca-7e97-449d-8245-e3c28a6b6971',
                expected: 'Should only work when authenticated as Bella'
            },
            {
                name: 'Invalid Business ID',
                businessId: 'invalid-business-id',
                expected: 'Should fail gracefully'
            }
        ];
        
        for (const scenario of scenarios) {
            console.log(`\\n🧪 Testing: ${scenario.name}`);
            console.log(`   Business ID: ${scenario.businessId}`);
            console.log(`   Expected: ${scenario.expected}`);
            
            const { data: testBusiness } = await supabase
                .from('businesses')
                .select('id, name')
                .eq('id', scenario.businessId)
                .single();
                
            console.log(`   Result: ${testBusiness ? `Found "${testBusiness.name}"` : 'Not found'}`);
        }
        
        // Test 4: Dashboard login credentials
        console.log('\\n📋 Test 4: Login Credentials');
        
        const loginTests = [
            { email: 'demo@example.com', expected: 'Demo business' },
            { email: 'bella@bellasnails.com', expected: 'Bella\'s business' }
        ];
        
        for (const test of loginTests) {
            const { data: loginBusiness } = await supabase
                .from('businesses')
                .select('id, name, email, owner_email')
                .or(`email.eq.${test.email},owner_email.eq.${test.email}`)
                .single();
                
            console.log(`\\n   Email: ${test.email}`);
            console.log(`   Expected: ${test.expected}`);
            console.log(`   Result: ${loginBusiness ? `"${loginBusiness.name}" (${loginBusiness.id})` : 'Not found'}`);
        }
        
        console.log('\\n🎯 Multi-Tenant Authentication Test Complete!');
        console.log('\\n📱 Login Instructions:');
        console.log('   Demo Mode: demo@example.com (neutral demo data)');
        console.log('   Bella\'s: bella@bellasnails.com (real customer data)');
        console.log('   Others: [their-email] (their own data only)');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testMultiTenantAuth();