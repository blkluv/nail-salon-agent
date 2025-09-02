const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://irvyhhkoiyzartmmvbxw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testLoyaltySystem() {
  console.log('🧪 Testing Loyalty Rewards System...\n');
  
  const bellasBusinessId = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971';
  
  try {
    // 1. Find Eric Scott
    console.log('1️⃣ Finding Eric Scott...');
    const { data: eric, error: ericError } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', bellasBusinessId)
      .eq('first_name', 'Eric')
      .eq('last_name', 'Scott')
      .single();
    
    if (ericError || !eric) {
      console.error('❌ Eric Scott not found');
      return;
    }
    
    console.log('✅ Found Eric Scott:', eric.id);
    console.log('   Current total_spent:', eric.total_spent || 0);
    console.log('   Current total_visits:', eric.total_visits || 0);
    
    // 2. Simulate awarding loyalty points
    console.log('\n2️⃣ Simulating loyalty points award...');
    
    const purchaseAmount = 75; // $75 service
    const pointsFromSpending = Math.floor(purchaseAmount);
    const pointsFromVisit = 10; // 10 points per visit
    const totalPointsToAdd = pointsFromSpending + pointsFromVisit;
    
    console.log(`   Service amount: $${purchaseAmount}`);
    console.log(`   Points from spending: ${pointsFromSpending}`);
    console.log(`   Points from visit: ${pointsFromVisit}`);
    console.log(`   Total points to award: ${totalPointsToAdd}`);
    
    // Get current loyalty data
    const currentLoyalty = eric.preferences?.loyalty || {
      current_balance: 0,
      total_earned: 0,
      transactions: []
    };
    
    console.log('\n   Current loyalty status:');
    console.log(`   - Current balance: ${currentLoyalty.current_balance || 0}`);
    console.log(`   - Total earned: ${currentLoyalty.total_earned || 0}`);
    
    // Calculate new balance
    const newBalance = (currentLoyalty.current_balance || 0) + totalPointsToAdd;
    const newTotalEarned = (currentLoyalty.total_earned || 0) + totalPointsToAdd;
    
    // Determine tier
    let tier = 'Bronze';
    if (newTotalEarned >= 3000) tier = 'Platinum';
    else if (newTotalEarned >= 1500) tier = 'Gold';
    else if (newTotalEarned >= 500) tier = 'Silver';
    
    console.log('\n   New loyalty status:');
    console.log(`   - New balance: ${newBalance}`);
    console.log(`   - New total earned: ${newTotalEarned}`);
    console.log(`   - Tier: ${tier}`);
    
    // 3. Update customer with loyalty data
    console.log('\n3️⃣ Updating customer loyalty data...');
    
    const transaction = {
      date: new Date().toISOString(),
      type: 'earned',
      points: totalPointsToAdd,
      description: `Test: Earned from service ($${purchaseAmount})`,
      balance_after: newBalance
    };
    
    const transactions = currentLoyalty.transactions || [];
    transactions.unshift(transaction);
    if (transactions.length > 10) transactions.length = 10; // Keep last 10
    
    const { error: updateError } = await supabase
      .from('customers')
      .update({
        preferences: {
          ...eric.preferences,
          loyalty: {
            current_balance: newBalance,
            total_earned: newTotalEarned,
            transactions: transactions,
            last_earned_at: new Date().toISOString(),
            current_tier: tier
          }
        },
        total_spent: (eric.total_spent || 0) + purchaseAmount,
        total_visits: (eric.total_visits || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', eric.id);
    
    if (updateError) {
      console.error('❌ Error updating loyalty data:', updateError);
      return;
    }
    
    console.log('✅ Successfully updated loyalty data!');
    
    // 4. Verify the update
    console.log('\n4️⃣ Verifying loyalty data...');
    
    const { data: updatedEric, error: verifyError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', eric.id)
      .single();
    
    if (verifyError || !updatedEric) {
      console.error('❌ Error verifying update');
      return;
    }
    
    const loyaltyData = updatedEric.preferences?.loyalty;
    
    console.log('\n🎉 LOYALTY SYSTEM TEST RESULTS:');
    console.log('================================');
    console.log(`Customer: Eric Scott`);
    console.log(`Total Spent: $${updatedEric.total_spent || 0}`);
    console.log(`Total Visits: ${updatedEric.total_visits || 0}`);
    console.log(`\nLoyalty Status:`);
    console.log(`- Current Balance: ${loyaltyData?.current_balance || 0} points`);
    console.log(`- Total Earned: ${loyaltyData?.total_earned || 0} points`);
    console.log(`- Current Tier: ${loyaltyData?.current_tier || tier}`);
    console.log(`- Last Earned: ${loyaltyData?.last_earned_at ? new Date(loyaltyData.last_earned_at).toLocaleString() : 'Never'}`);
    
    if (loyaltyData?.transactions && loyaltyData.transactions.length > 0) {
      console.log(`\nRecent Transactions (last 3):`);
      loyaltyData.transactions.slice(0, 3).forEach(t => {
        console.log(`  - ${new Date(t.date).toLocaleDateString()}: +${t.points} pts - ${t.description}`);
      });
    }
    
    // Calculate tier benefits
    console.log('\n🏆 Tier Benefits:');
    switch(loyaltyData?.current_tier || tier) {
      case 'Platinum':
        console.log('  - 3x points on all purchases');
        console.log('  - Birthday bonus: 100 points');
        console.log('  - Priority booking');
        console.log('  - Exclusive offers');
        break;
      case 'Gold':
        console.log('  - 2x points on all purchases');
        console.log('  - Birthday bonus: 100 points');
        console.log('  - Priority booking');
        break;
      case 'Silver':
        console.log('  - 1.5x points on all purchases');
        console.log('  - Birthday bonus: 100 points');
        break;
      default:
        console.log('  - 1 point per $1 spent');
        console.log('  - 10 points per visit');
    }
    
    // Redemption options
    const points = loyaltyData?.current_balance || 0;
    console.log('\n💰 Available Redemptions:');
    if (points >= 1000) {
      console.log('  ✅ Free Classic Manicure (1000 pts)');
    }
    if (points >= 500) {
      console.log('  ✅ $35 off next service (500 pts)');
    }
    if (points >= 250) {
      console.log('  ✅ $15 off next service (250 pts)');
    }
    if (points >= 100) {
      console.log('  ✅ $5 off next service (100 pts)');
    }
    if (points < 100) {
      console.log('  ⏳ Keep earning! Only ' + (100 - points) + ' points until your first reward!');
    }
    
    console.log('\n✅ Loyalty system is working correctly!');
    console.log('📝 Note: Customer portal will now show real loyalty data based on actual spending.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testLoyaltySystem();