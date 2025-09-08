const fs = require('fs');

async function testProvisioning() {
  const testData = JSON.parse(fs.readFileSync('test-onboarding-data.json', 'utf8'));
  
  console.log('🧪 Testing provisioning API with test data...');
  console.log('Business Name:', testData.businessInfo.name);
  
  try {
    const response = await fetch('http://localhost:3002/api/admin/provision-client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const responseText = await response.text();
    console.log('\n📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers));
    
    try {
      const data = JSON.parse(responseText);
      
      if (data.success) {
        console.log('\n✅ Success Response:');
        console.log('Business ID:', data.businessId);
        console.log('Phone Number:', data.phoneNumber);
        console.log('Assistant ID:', data.assistantId);
        console.log('Assistant Type:', data.assistantType);
        console.log('\n🎉 Provisioning completed successfully!');
        console.log('- Business created with unique slug');
        console.log('- Phone number provisioned');
        console.log('- Assistant configured');
        console.log('- Services auto-generated');
      } else {
        console.log('\n❌ Error Response:');
        console.log('Error:', data.error);
        console.log('Details:', data.details);
        
        if (responseText.includes('duplicate key value violates unique constraint')) {
          console.log('\n🔍 Slug uniqueness issue detected!');
          console.log('The timestamp suffix fix may not be working properly.');
        }
      }
    } catch (parseError) {
      console.log('\n❌ Raw Response (not JSON):', responseText);
      
      if (responseText.includes('duplicate key value violates unique constraint')) {
        console.log('\n🔍 Slug uniqueness issue detected!');
        console.log('The timestamp suffix fix may not be working properly.');
      } else if (responseText.includes('Setup Failed')) {
        console.log('\n🔍 Setup failure detected - checking error details...');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Network/Request Error:', error.message);
  }
}

testProvisioning();