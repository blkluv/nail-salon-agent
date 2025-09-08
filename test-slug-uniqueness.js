// Test script to verify slug uniqueness fix with multiple businesses

async function testSlugUniqueness() {
  console.log('🧪 Testing slug uniqueness with multiple businesses...');
  
  const baseBusinessName = "Test Beauty Salon";
  
  for (let i = 1; i <= 3; i++) {
    console.log(`\n📝 Creating business ${i}/3...`);
    
    const testData = {
      businessInfo: {
        name: baseBusinessName, // Same name for all tests
        email: `test-unique-${Date.now()}-${i}@testsalon.com`,
        phone: `+1555123456${i}`,
        businessType: "Beauty Salon",
        ownerFirstName: "Test",
        ownerLastName: "Owner"
      },
      selectedPlan: "professional",
      paymentMethodId: "skip_payment_validation",
      rapidSetup: true
    };
    
    console.log(`Name: "${testData.businessInfo.name}"`);
    console.log(`Email: "${testData.businessInfo.email}"`);
    
    try {
      const response = await fetch('http://localhost:3002/api/admin/provision-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      const responseText = await response.text();
      
      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          if (data.success) {
            console.log(`✅ Success! Business ID: ${data.businessId}`);
            console.log(`📝 Business Name: ${data.businessName}`);
          } else {
            console.log(`❌ API Error: ${data.error}`);
            console.log(`Details: ${data.details}`);
          }
        } catch (parseError) {
          console.log('❌ Parse error:', parseError.message);
        }
      } else {
        console.log(`❌ HTTP Error ${response.status}:`, responseText);
      }
      
    } catch (error) {
      console.error('❌ Network Error:', error.message);
    }
    
    // Wait between requests to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🔍 Checking database for slug patterns...');
  
  // Check the database
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    'https://irvyhhkoiyzartmmvbxw.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk'
  );
  
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('name, slug, created_at')
    .ilike('name', '%Test Beauty Salon%')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('❌ Database query error:', error);
    return;
  }
  
  console.log('\n📊 Test Beauty Salon businesses:');
  businesses.forEach((business, index) => {
    console.log(`${index + 1}. "${business.name}" → slug: "${business.slug}"`);
    console.log(`   Created: ${new Date(business.created_at).toLocaleString()}`);
  });
  
  // Analyze slug uniqueness
  const slugs = businesses.map(b => b.slug);
  const uniqueSlugs = [...new Set(slugs)];
  
  console.log('\n🎯 Slug Uniqueness Results:');
  console.log(`Total businesses: ${businesses.length}`);
  console.log(`Unique slugs: ${uniqueSlugs.length}`);
  console.log(`Duplicates: ${businesses.length - uniqueSlugs.length}`);
  
  if (businesses.length === uniqueSlugs.length) {
    console.log('✅ SLUG UNIQUENESS FIX IS WORKING! All slugs are unique.');
  } else {
    console.log('❌ Slug uniqueness issue detected. Some duplicates found.');
  }
}

testSlugUniqueness();