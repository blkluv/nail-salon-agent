// Simple test script to verify backend functionality
// Run this after setting up your environment variables

const axios = require('axios').default;
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-railway-app.railway.app' 
  : 'http://localhost:3001';

const BUSINESS_ID = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';
const TEST_PHONE = '+15551234567'; // Use a test phone number

async function runTests() {
  console.log('🧪 Testing Backend Implementation...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Analytics Dashboard (should work even without data)
    console.log('\n2. Testing analytics dashboard...');
    try {
      const analyticsResponse = await axios.get(`${BASE_URL}/api/analytics/dashboard/${BUSINESS_ID}`);
      console.log('✅ Analytics dashboard:', analyticsResponse.data);
    } catch (analyticsError) {
      console.log('⚠️  Analytics dashboard error (expected if no data):', analyticsError.response?.data || analyticsError.message);
    }

    // Test 3: Customer Auth - Send Verification (will fail without Twilio setup)
    console.log('\n3. Testing customer verification...');
    try {
      const verificationResponse = await axios.post(`${BASE_URL}/api/customer/auth/send-verification`, {
        businessId: BUSINESS_ID,
        phoneNumber: TEST_PHONE
      });
      console.log('✅ Verification sent:', verificationResponse.data);
    } catch (verificationError) {
      console.log('⚠️  Verification error (expected without Twilio):', verificationError.response?.data || verificationError.message);
    }

    // Test 4: Test simple customer verification endpoint
    console.log('\n4. Testing simple verification endpoint...');
    try {
      const simpleVerificationResponse = await axios.post(`${BASE_URL}/api/customer/send-verification`, {
        phone: TEST_PHONE,
        businessId: BUSINESS_ID
      });
      console.log('✅ Simple verification:', simpleVerificationResponse.data);
    } catch (simpleError) {
      console.log('⚠️  Simple verification error:', simpleError.response?.data || simpleError.message);
    }

    console.log('\n🎉 Backend tests completed!');
    console.log('\nNext steps:');
    console.log('1. Run the SQL script in Supabase: database-schema-updates.sql');
    console.log('2. Update your .env file with Twilio credentials');
    console.log('3. Deploy to Railway and test production endpoints');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Server is not running. Start it with: npm start');
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };