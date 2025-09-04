const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkStaffData() {
  try {
    console.log('🔍 Checking staff data in database...\n');
    
    // Get all businesses first
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .limit(5);
      
    if (businessError) {
      console.error('❌ Error fetching businesses:', businessError);
      return;
    }
    
    console.log('📊 Found', businesses.length, 'businesses:');
    businesses.forEach(b => console.log(`   - ${b.name} (${b.id.substring(0, 8)}...)`));
    
    // Check staff for each business
    for (const business of businesses) {
      console.log(`\n👥 Staff for ${business.name}:`);
      
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('id, first_name, last_name, email, phone, role, is_active')
        .eq('business_id', business.id);
        
      if (staffError) {
        console.error(`   ❌ Error fetching staff: ${staffError.message}`);
        continue;
      }
      
      if (!staff || staff.length === 0) {
        console.log('   ⚠️  No staff members found');
      } else {
        staff.forEach(s => {
          const status = s.is_active ? '✅' : '❌';
          console.log(`   ${status} ${s.first_name} ${s.last_name} (${s.role}) - ${s.email}`);
        });
      }
    }
    
    console.log('\n📈 Staff table summary:');
    const { data: staffCount, error: countError } = await supabase
      .from('staff')
      .select('business_id')
      .eq('is_active', true);
      
    if (!countError && staffCount) {
      console.log(`   Total active staff across all businesses: ${staffCount.length}`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkStaffData();