// Test to verify if there's a unique email constraint

async function testEmailConstraint() {
  console.log('🧪 Testing email constraint by attempting duplicate email...');
  
  const testData = {
    businessInfo: {
      name: "Email Constraint Test Business",
      email: "demo@example.com", // This email already exists in the database
      phone: "+15559999999",
      businessType: "Beauty Salon",
      ownerFirstName: "Test",
      ownerLastName: "Owner"
    },
    selectedPlan: "professional",
    paymentMethodId: "skip_payment_validation",
    rapidSetup: true
  };
  
  console.log('📧 Attempting to create business with existing email:', testData.businessInfo.email);
  
  try {
    const response = await fetch('http://localhost:3003/api/admin/provision-client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const responseText = await response.text();
    
    console.log('📊 Response Status:', response.status);
    
    try {
      const data = JSON.parse(responseText);
      
      if (data.success) {
        console.log('⚠️  UNEXPECTED: Business created despite duplicate email!');
        console.log('Business ID:', data.businessId);
        console.log('This suggests there is NO unique constraint on email field.');
      } else {
        console.log('✅ EXPECTED: Business creation failed');
        console.log('Error:', data.error);
        console.log('Details:', data.details);
        
        if (data.details.includes('duplicate key value violates unique constraint')) {
          if (data.details.includes('businesses_email_key')) {
            console.log('🔍 CONFIRMED: Email has unique constraint (businesses_email_key)');
          } else {
            console.log('🔍 Different unique constraint:', data.details);
          }
        }
      }
    } catch (parseError) {
      console.log('❌ Response parse error:', parseError.message);
      console.log('Raw response:', responseText);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testEmailConstraint();