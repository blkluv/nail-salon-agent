const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://irvyhhkoiyzartmmvbxw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydnloaGtvaXl6YXJ0bW12Ynh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExODI5MywiZXhwIjoyMDcwNjk0MjkzfQ.61Zfyc87GpmpIlWFL1fyX6wcfydqCu6DUFuHnpNSvhk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupLoyaltySystem() {
  console.log('🎯 Setting up Loyalty System...\n');
  
  try {
    // 1. Create loyalty_programs table
    console.log('1️⃣ Creating loyalty_programs table...');
    const { error: lpError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS loyalty_programs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
          is_active BOOLEAN DEFAULT true,
          program_name VARCHAR(255) DEFAULT 'Loyalty Rewards',
          points_per_dollar INTEGER DEFAULT 1,
          points_per_visit INTEGER DEFAULT 10,
          referral_points INTEGER DEFAULT 50,
          birthday_bonus_points INTEGER DEFAULT 100,
          reward_tiers JSONB DEFAULT '[]'::jsonb,
          redemption_options JSONB DEFAULT '[]'::jsonb,
          points_expire_days INTEGER DEFAULT 365,
          minimum_purchase_for_points DECIMAL(10,2) DEFAULT 10.00,
          max_points_per_transaction INTEGER DEFAULT 500,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(business_id)
        );
      `
    });
    
    if (lpError && !lpError.message.includes('already exists')) {
      console.error('Error creating loyalty_programs:', lpError);
    } else {
      console.log('✅ loyalty_programs table ready');
    }
    
    // 2. Create customer_loyalty_points table
    console.log('2️⃣ Creating customer_loyalty_points table...');
    const { error: clpError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS customer_loyalty_points (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
          customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
          total_points_earned INTEGER DEFAULT 0,
          total_points_redeemed INTEGER DEFAULT 0,
          current_balance INTEGER DEFAULT 0,
          current_tier VARCHAR(50) DEFAULT 'Bronze',
          tier_progress DECIMAL(5,2) DEFAULT 0,
          last_earned_at TIMESTAMP WITH TIME ZONE,
          last_redeemed_at TIMESTAMP WITH TIME ZONE,
          total_visits INTEGER DEFAULT 0,
          total_spent DECIMAL(10,2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(business_id, customer_id)
        );
      `
    });
    
    if (clpError && !clpError.message.includes('already exists')) {
      console.error('Error creating customer_loyalty_points:', clpError);
    } else {
      console.log('✅ customer_loyalty_points table ready');
    }
    
    // 3. Create loyalty_transactions table
    console.log('3️⃣ Creating loyalty_transactions table...');
    const { error: ltError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS loyalty_transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
          customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
          appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
          transaction_type VARCHAR(50) NOT NULL,
          points_amount INTEGER NOT NULL,
          description TEXT,
          purchase_amount DECIMAL(10,2),
          points_multiplier DECIMAL(3,2) DEFAULT 1.0,
          redemption_value DECIMAL(10,2),
          redemption_item VARCHAR(255),
          balance_before INTEGER NOT NULL,
          balance_after INTEGER NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE,
          expired BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (ltError && !ltError.message.includes('already exists')) {
      console.error('Error creating loyalty_transactions:', ltError);
    } else {
      console.log('✅ loyalty_transactions table ready');
    }
    
    // 4. Create/Update Bella's loyalty program
    console.log('4️⃣ Setting up Bella\'s Rewards Club...');
    const bellasBusinessId = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971';
    
    const { data: existingProgram } = await supabase
      .from('loyalty_programs')
      .select('*')
      .eq('business_id', bellasBusinessId)
      .single();
    
    const loyaltyProgramData = {
      business_id: bellasBusinessId,
      is_active: true,
      program_name: 'Bella\'s Rewards Club',
      points_per_dollar: 1,
      points_per_visit: 10,
      referral_points: 50,
      birthday_bonus_points: 100,
      reward_tiers: [
        {name: 'Bronze', min_points: 0, benefits: ['1 point per $1 spent'], color: '#CD7F32'},
        {name: 'Silver', min_points: 500, benefits: ['1.5 points per $1 spent', 'Birthday bonus'], color: '#C0C0C0'},
        {name: 'Gold', min_points: 1500, benefits: ['2 points per $1 spent', 'Birthday bonus', 'Priority booking'], color: '#FFD700'},
        {name: 'Platinum', min_points: 3000, benefits: ['3 points per $1 spent', 'Birthday bonus', 'Priority booking', 'Exclusive offers'], color: '#E5E4E2'}
      ],
      redemption_options: [
        {points: 100, reward: '$5 off next service', discount_amount: 500},
        {points: 250, reward: '$15 off next service', discount_amount: 1500},
        {points: 500, reward: '$35 off next service', discount_amount: 3500},
        {points: 1000, reward: 'Free Classic Manicure', discount_amount: 4500}
      ]
    };
    
    if (existingProgram) {
      const { error: updateError } = await supabase
        .from('loyalty_programs')
        .update(loyaltyProgramData)
        .eq('business_id', bellasBusinessId);
      
      if (updateError) {
        console.error('Error updating loyalty program:', updateError);
      } else {
        console.log('✅ Updated Bella\'s Rewards Club');
      }
    } else {
      const { error: insertError } = await supabase
        .from('loyalty_programs')
        .insert(loyaltyProgramData);
      
      if (insertError) {
        console.error('Error creating loyalty program:', insertError);
      } else {
        console.log('✅ Created Bella\'s Rewards Club');
      }
    }
    
    // 5. Add sample loyalty data for Eric Scott
    console.log('5️⃣ Adding sample loyalty data for Eric Scott...');
    
    // First, find Eric Scott's customer ID
    const { data: ericCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('business_id', bellasBusinessId)
      .eq('first_name', 'Eric')
      .eq('last_name', 'Scott')
      .single();
    
    if (ericCustomer) {
      // Create or update Eric's loyalty points
      const { error: pointsError } = await supabase
        .from('customer_loyalty_points')
        .upsert({
          business_id: bellasBusinessId,
          customer_id: ericCustomer.id,
          total_points_earned: 125,
          total_points_redeemed: 0,
          current_balance: 125,
          current_tier: 'Bronze',
          tier_progress: 25, // 25% to Silver
          total_visits: 3,
          total_spent: 125.00,
          last_earned_at: new Date().toISOString()
        }, {
          onConflict: 'business_id,customer_id'
        });
      
      if (pointsError) {
        console.error('Error setting Eric\'s points:', pointsError);
      } else {
        console.log('✅ Set Eric Scott to 125 loyalty points (Bronze tier)');
        
        // Add a sample transaction
        const { error: transError } = await supabase
          .from('loyalty_transactions')
          .insert({
            business_id: bellasBusinessId,
            customer_id: ericCustomer.id,
            transaction_type: 'earned',
            points_amount: 55,
            description: 'Points earned from Classic Manicure',
            purchase_amount: 55.00,
            points_multiplier: 1.0,
            balance_before: 70,
            balance_after: 125,
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          });
        
        if (transError) {
          console.error('Error adding transaction:', transError);
        } else {
          console.log('✅ Added sample transaction history');
        }
      }
    } else {
      console.log('⚠️ Eric Scott not found in customers table');
    }
    
    // 6. Verify setup
    console.log('\n📊 Verifying Loyalty System Setup...');
    
    const { data: program } = await supabase
      .from('loyalty_programs')
      .select('*')
      .eq('business_id', bellasBusinessId)
      .single();
    
    if (program) {
      console.log('✅ Loyalty Program:', program.program_name);
      console.log('   - Points per dollar:', program.points_per_dollar);
      console.log('   - Points per visit:', program.points_per_visit);
      console.log('   - Birthday bonus:', program.birthday_bonus_points);
    }
    
    const { data: customerPoints } = await supabase
      .from('customer_loyalty_points')
      .select('*, customer:customers(first_name, last_name)')
      .eq('business_id', bellasBusinessId);
    
    if (customerPoints && customerPoints.length > 0) {
      console.log('\n👥 Customer Loyalty Status:');
      customerPoints.forEach(cp => {
        const name = cp.customer ? `${cp.customer.first_name} ${cp.customer.last_name}` : 'Unknown';
        console.log(`   - ${name}: ${cp.current_balance} points (${cp.current_tier})`);
      });
    }
    
    console.log('\n🎉 Loyalty system setup complete!');
    console.log('📝 Note: Points will be automatically awarded when appointments are marked as completed.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the setup
setupLoyaltySystem();