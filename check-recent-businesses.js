const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://irvyhhkoiyzartmmvbxw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk'
);

async function checkRecentBusinesses() {
  console.log('🔍 Checking recent businesses in database...');
  
  try {
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, name, slug, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    console.log(`\n📊 Found ${businesses.length} recent businesses:`);
    
    businesses.forEach((business, index) => {
      console.log(`${index + 1}. Name: "${business.name}"`);
      console.log(`   Slug: "${business.slug}"`);
      console.log(`   ID: ${business.id}`);
      console.log(`   Created: ${new Date(business.created_at).toLocaleString()}`);
      console.log('');
    });
    
    // Check for potential conflicts
    const slugCounts = {};
    businesses.forEach(business => {
      const baseSlug = business.slug.split('-').slice(0, -1).join('-'); // Remove timestamp suffix
      slugCounts[baseSlug] = (slugCounts[baseSlug] || 0) + 1;
    });
    
    console.log('📈 Slug base patterns:');
    Object.entries(slugCounts).forEach(([baseSlug, count]) => {
      if (count > 1) {
        console.log(`   "${baseSlug}*": ${count} businesses (good - unique suffixes working)`);
      } else {
        console.log(`   "${baseSlug}": ${count} business`);
      }
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkRecentBusinesses();