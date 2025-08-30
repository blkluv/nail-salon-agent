const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://irvyhhkoiyzartmmvbxw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function debugCustomerLogin() {
  console.log('🔍 Debugging customer login flow...\n');
  
  const inputPhone = '(555) 123-4567';
  const normalizedPhone = inputPhone.replace(/\D/g, '');
  
  console.log('Input phone:', inputPhone);
  console.log('Normalized phone:', normalizedPhone);
  
  // Step 1: Find customer by phone (exact same logic as BusinessDiscoveryService)
  console.log('\n1. Looking up customer by normalized phone...');
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, phone, first_name, last_name')
    .eq('phone', normalizedPhone)
    .single();
  
  if (customerError) {
    console.log('❌ Customer error:', customerError);
    return;
  }
  
  if (!customer) {
    console.log('❌ No customer found');
    return;
  }
  
  console.log('✅ Customer found:', customer);
  
  // Step 2: Check relationships
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
        subscription_status
      )
    `)
    .eq('customer_id', customer.id);
  
  if (relError) {
    console.log('❌ Relationship error:', relError);
    return;
  }
  
  console.log('✅ Relationships found:', relationships.length);
  console.log('Raw relationships:', JSON.stringify(relationships, null, 2));
  
  // Step 3: Filter active businesses
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
  
  console.log('\n3. Active businesses for login:');
  console.log(JSON.stringify(activeBusinesses, null, 2));
  
  return activeBusinesses;
}

debugCustomerLogin();