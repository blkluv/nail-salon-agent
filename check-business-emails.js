const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://irvyhhkoiyzartmmvbxw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk'
);

async function checkBusinessEmails() {
  console.log('📧 Checking business emails for duplicates...');
  
  try {
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(15);
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    console.log(`\n📊 Found ${businesses.length} businesses:\n`);
    
    const emailCounts = {};
    
    businesses.forEach((business, index) => {
      console.log(`${index + 1}. "${business.name}"`);
      console.log(`   Email: "${business.email}"`);
      console.log(`   ID: ${business.id}`);
      console.log(`   Created: ${new Date(business.created_at).toLocaleString()}`);
      console.log('');
      
      // Count email occurrences
      if (business.email) {
        emailCounts[business.email] = (emailCounts[business.email] || 0) + 1;
      }
    });
    
    console.log('📈 Email duplicate analysis:');
    Object.entries(emailCounts).forEach(([email, count]) => {
      if (count > 1) {
        console.log(`   ❌ DUPLICATE: "${email}" used ${count} times`);
      } else {
        console.log(`   ✅ UNIQUE: "${email}"`);
      }
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkBusinessEmails();