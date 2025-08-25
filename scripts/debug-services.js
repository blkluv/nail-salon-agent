// Debug services issue
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BUSINESS_ID = process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID || '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';

async function debugServices() {
  console.log('🔍 Debugging Services Issue...\n');
  
  try {
    // Check all services for this business
    console.log('1. Checking all services (including inactive)...');
    const { data: allServices, error: allError } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', BUSINESS_ID);
    
    if (allError) {
      console.log('❌ Error querying services:', allError.message);
      return;
    }
    
    console.log(`Found ${allServices?.length || 0} total services for business ${BUSINESS_ID}`);
    
    if (allServices && allServices.length > 0) {
      allServices.forEach((service, i) => {
        console.log(`   ${i + 1}. ${service.name} (${service.category})`);
        console.log(`      Active: ${service.is_active}`);
        console.log(`      Price: $${service.price}`);
        console.log(`      Duration: ${service.duration_minutes}min`);
      });
    } else {
      console.log('   No services found at all!');
    }
    
    // Check active services specifically
    console.log('\n2. Checking active services only...');
    const { data: activeServices, error: activeError } = await supabase
      .from('services')
      .select('id, name, category, duration_minutes, price, is_active')
      .eq('business_id', BUSINESS_ID)
      .eq('is_active', true);
    
    if (activeError) {
      console.log('❌ Error querying active services:', activeError.message);
      return;
    }
    
    console.log(`Found ${activeServices?.length || 0} active services`);
    
    // Check business exists
    console.log('\n3. Verifying business ID...');
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('id', BUSINESS_ID)
      .single();
    
    if (businessError) {
      console.log('❌ Business error:', businessError.message);
      return;
    }
    
    console.log(`Business found: ${business.name} (${business.id})`);
    
    // Try to create a service manually to test
    console.log('\n4. Testing service creation...');
    const testService = {
      business_id: BUSINESS_ID,
      name: 'Test Debug Service',
      category: 'manicure',
      price: 25.00,
      duration_minutes: 30,
      is_active: true,
      description: 'Debug test service'
    };
    
    const { data: createdService, error: createError } = await supabase
      .from('services')
      .insert(testService)
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Failed to create test service:', createError.message);
      console.log('   Details:', createError);
    } else {
      console.log('✅ Successfully created test service:', createdService.name);
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

debugServices();