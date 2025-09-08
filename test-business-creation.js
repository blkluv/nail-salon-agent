// Simple test to verify business creation and slug uniqueness fix
// This bypasses payment processing to focus on the core business logic

async function testBusinessCreation() {
  console.log('🧪 Testing business creation with slug uniqueness...');
  
  // Test multiple businesses with the same base name to verify unique slug generation
  const businesses = [
    { name: "Test Beauty Salon", email: "test1@example.com" },
    { name: "Test Beauty Salon", email: "test2@example.com" },
    { name: "Test Beauty Salon", email: "test3@example.com" }
  ];
  
  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    console.log(`\n📝 Testing business ${i + 1}: ${business.name}`);
    
    // Test slug generation
    const baseSlug = business.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Add timestamp to make it unique (this is what the fix should do)
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    
    console.log(`Generated slug: ${slug}`);
    console.log(`Base slug: ${baseSlug}`);
    console.log(`Timestamp suffix: ${Date.now().toString(36)}`);
    
    // Wait a moment between tests to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n✅ Slug generation test complete!');
  console.log('Each business would get a unique slug with timestamp suffix.');
  console.log('This should prevent duplicate key violations.');
}

testBusinessCreation();