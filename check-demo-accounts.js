const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  'https://lcwwcbiixjdlexelykyi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjd3djYmlpeGpkbGV4ZWx5a3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI3MjM0MzYsImV4cCI6MjA0ODI5OTQzNn0.XNTaFKpo4aHJWUZFSJzCL1VNRlpiLSNA5OhM4v8WQ3E'
);

async function checkDemoAccounts() {
  console.log('🔍 Checking for existing demo accounts...\n');

  try {
    // Check for demo/test accounts
    const { data: demoAccounts, error } = await supabase
      .from('businesses')
      .select('id, name, email, subscription_tier, maya_job_id, phone_number, created_at, slug')
      .or('email.ilike.%demo%,email.ilike.%test%,name.ilike.%demo%,name.ilike.%test%')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching demo accounts:', error);
      return;
    }

    if (demoAccounts && demoAccounts.length > 0) {
      console.log('✅ Found existing demo accounts:\n');
      console.log('=====================================\n');
      
      demoAccounts.forEach((account, index) => {
        console.log(`Demo Account #${index + 1}:`);
        console.log(`  📋 Name: ${account.name}`);
        console.log(`  📧 Email: ${account.email}`);
        console.log(`  🎯 Maya Job: ${account.maya_job_id || 'Not set'}`);
        console.log(`  💼 Tier: ${account.subscription_tier}`);
        console.log(`  📞 Phone: ${account.phone_number || 'Not set'}`);
        console.log(`  🔗 Dashboard URL: http://localhost:3000/dashboard?business_id=${account.id}`);
        console.log(`  🌐 Public URL: http://localhost:3000/${account.slug}`);
        console.log(`  📅 Created: ${new Date(account.created_at).toLocaleDateString()}`);
        console.log('-------------------------------------\n');
      });

      // Show login instructions
      console.log('📝 TO ACCESS A DEMO DASHBOARD:\n');
      console.log('1. Start the dashboard server:');
      console.log('   cd dashboard && npm run dev\n');
      console.log('2. Use one of these methods to access:');
      console.log('   a) Direct URL with business_id parameter (shown above)');
      console.log('   b) Set localStorage and navigate:');
      console.log('      localStorage.setItem("authenticated_business_id", "BUSINESS_ID_HERE")');
      console.log('      localStorage.setItem("authenticated_business_name", "BUSINESS_NAME_HERE")');
      console.log('      Then go to: http://localhost:3000/dashboard\n');
      
    } else {
      console.log('❌ No demo accounts found.\n');
      console.log('Would you like to create demo accounts? Let me know and I can:');
      console.log('1. Create demo accounts for each Maya job type');
      console.log('2. Set up different tier demos (Starter, Professional, Business)');
      console.log('3. Configure with test phone numbers and agents');
    }

    // Also check for recent real accounts
    console.log('\n🔍 Checking for recent accounts (last 5)...\n');
    const { data: recentAccounts, error: recentError } = await supabase
      .from('businesses')
      .select('id, name, email, subscription_tier, maya_job_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentAccounts && recentAccounts.length > 0) {
      console.log('Recent accounts in system:');
      recentAccounts.forEach(account => {
        console.log(`  - ${account.name} (${account.email}) - ${account.maya_job_id || 'No Maya job'} - Created: ${new Date(account.created_at).toLocaleDateString()}`);
      });
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Run the check
checkDemoAccounts();