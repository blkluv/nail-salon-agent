const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://irvyhhkoiyzartmmvbxw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testPhoneDiscovery() {
  console.log('🔍 Testing phone-based business discovery...\n');
  
  const testPhone = '5551234567';
  
  try {
    // 1. Find customer by phone
    console.log('1. Looking up customer by phone:', testPhone);
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, first_name, last_name, phone')
      .eq('phone', testPhone)
      .single();
    
    if (customerError || !customer) {
      console.log('❌ No customer found for phone:', testPhone);
      return;
    }
    
    console.log('✅ Customer found:', customer);
    
    // 2. Get business relationships
    console.log('\n2. Getting business relationships...');
    const { data: relationships, error: relError } = await supabase
      .from('customer_business_relationships')
      .select(`
        business_id,
        is_preferred,
        last_visit_date,
        total_visits,
        business:businesses(
          id,
          name,
          slug,
          phone,
          city,
          state,
          subscription_status
        )
      `)
      .eq('customer_id', customer.id)
      .order('is_preferred', { ascending: false });
    
    if (relError) {
      console.log('❌ Error fetching relationships:', relError);
      return;
    }
    
    console.log('✅ Relationships found:', relationships.length);
    console.log('Raw relationships data:', JSON.stringify(relationships, null, 2));
    
    // 3. Transform and filter
    const activeBusinesses = relationships
      ?.filter(rel => rel.business && rel.business.subscription_status === 'active')
      ?.map(rel => ({
        business_id: rel.business_id,
        business_name: rel.business.name,
        business_slug: rel.business.slug,
        is_preferred: rel.is_preferred,
        last_visit_date: rel.last_visit_date,
        total_visits: rel.total_visits
      })) || [];
    
    console.log('\n3. Active businesses for phone discovery:');
    console.log(JSON.stringify(activeBusinesses, null, 2));
    
    return activeBusinesses;
    
  } catch (error) {
    console.error('💥 Phone discovery test failed:', error);
  }
}

testPhoneDiscovery();