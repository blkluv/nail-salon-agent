#!/usr/bin/env node

// Test what business ID the dashboard would use
console.log('🔍 Testing Dashboard Authentication...');

// Simulate browser environment
const localStorage = {
    data: {},
    getItem(key) {
        return this.data[key] || null;
    },
    setItem(key, value) {
        this.data[key] = value;
    }
};

// Mock the environment
process.env.NODE_ENV = 'development';
process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID = '00000000-0000-0000-0000-000000000000';

function getCurrentBusinessId() {
    // Check if user is properly authenticated
    const authBusinessId = localStorage.getItem('authenticated_business_id');
    if (authBusinessId) {
        return authBusinessId;
    }
    
    // For development/testing only: use neutral demo business
    if (process.env.NODE_ENV === 'development') {
        return localStorage.getItem('demo_business_id') || process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID || null;
    }
    
    // Production: Force proper authentication, no fallbacks
    return null;
}

console.log('📋 Test Scenarios:');

// Scenario 1: No authentication (default)
console.log('\n1. No Authentication (Default):');
console.log('   Business ID:', getCurrentBusinessId());

// Scenario 2: Demo user logged in
console.log('\n2. Demo User (development):');
localStorage.setItem('demo_business_id', '00000000-0000-0000-0000-000000000000');
console.log('   Business ID:', getCurrentBusinessId());

// Scenario 3: Bella authenticated
console.log('\n3. Bella Authenticated:');
localStorage.setItem('authenticated_business_id', 'bb18c6ca-7e97-449d-8245-e3c28a6b6971');
localStorage.setItem('authenticated_business_name', 'Bella\'s Nails Studio');
localStorage.setItem('authenticated_user_email', 'bella@bellasnails.com');
console.log('   Business ID:', getCurrentBusinessId());

console.log('\n🎯 To see Bella\'s appointment in the dashboard:');
console.log('   1. Open http://localhost:3000');
console.log('   2. Go to browser console and run:');
console.log('      localStorage.setItem("authenticated_business_id", "bb18c6ca-7e97-449d-8245-e3c28a6b6971")');
console.log('      localStorage.setItem("authenticated_business_name", "Bella\'s Nails Studio")');
console.log('      localStorage.setItem("authenticated_user_email", "bella@bellasnails.com")');
console.log('   3. Refresh the page');
console.log('   4. The appointment should now appear!');