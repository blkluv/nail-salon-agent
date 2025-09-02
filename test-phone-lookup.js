#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://irvyhhkoiyzartmmvbxw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk');

async function testPhoneLookup() {
  console.log('🧪 Testing phone lookup logic...');
  
  // Test the lookup that webhook will use
  const testNumbers = ['+14243519304', '4243519304', '(424) 351-9304'];
  
  for (const phoneNumber of testNumbers) {
    console.log(`📞 Testing: ${phoneNumber}`);
    
    const { data: mapping, error } = await supabase
      .from('phone_business_mapping')
      .select(`
        business_id,
        businesses!inner(id, name)
      `)
      .eq('phone_number', phoneNumber)
      .eq('is_active', true)
      .single();
      
    if (mapping && !error) {
      console.log(`   ✅ Found: ${mapping.businesses.name} (${mapping.business_id})`);
    } else {
      console.log(`   ❌ Not found: ${error?.message || 'No match'}`);
    }
  }
  
  // Test E.164 formatting
  console.log('\n🔧 Testing E.164 formatting logic:');
  const rawNumbers = ['4243519304', '14243519304'];
  
  for (const raw of rawNumbers) {
    let cleanPhone = raw.replace(/[\D]/g, '');
    if (cleanPhone && !cleanPhone.startsWith('1')) {
      cleanPhone = '1' + cleanPhone;
    }
    const formattedPhone = cleanPhone ? `+${cleanPhone}` : null;
    console.log(`   ${raw} → ${formattedPhone}`);
  }
}

testPhoneLookup();