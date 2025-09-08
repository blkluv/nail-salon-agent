// Quick test of error handling on port 3004

async function testErrorHandling() {
  console.log('🧪 Testing enhanced error handling on port 3004...');
  
  const testData = {
    businessInfo: {
      name: "Error Test Business",
      email: "demo@example.com", // Known existing email
      phone: "+15558888888",
      businessType: "Beauty Salon",
      ownerFirstName: "Test",
      ownerLastName: "Owner"
    },
    selectedPlan: "professional",
    paymentMethodId: "skip_payment_validation",
    rapidSetup: true
  };
  
  try {
    const response = await fetch('http://localhost:3004/api/admin/provision-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const responseText = await response.text();
    console.log('Status:', response.status);
    
    if (response.status === 409) {
      const data = JSON.parse(responseText);
      console.log('✅ ENHANCED ERROR HANDLING WORKING!');
      console.log('Error Type:', data.errorType);
      console.log('User Message:', data.error);
      console.log('Details:', data.details);
    } else {
      console.log('❌ Response:', responseText.substring(0, 200));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testErrorHandling();