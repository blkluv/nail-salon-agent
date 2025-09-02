-- ============================================
-- LOYALTY SYSTEM SETUP
-- Creates all necessary tables for real loyalty rewards
-- ============================================

-- 1. Create loyalty_programs table (business-level settings)
CREATE TABLE IF NOT EXISTS loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Program settings
  is_active BOOLEAN DEFAULT true,
  program_name VARCHAR(255) DEFAULT 'Loyalty Rewards',
  
  -- Points configuration
  points_per_dollar INTEGER DEFAULT 1, -- Points earned per dollar spent
  points_per_visit INTEGER DEFAULT 10, -- Bonus points per visit
  referral_points INTEGER DEFAULT 50, -- Points for referring new customer
  birthday_bonus_points INTEGER DEFAULT 100, -- Birthday bonus
  
  -- Tier configuration (JSONB for flexibility)
  reward_tiers JSONB DEFAULT '[
    {"name": "Bronze", "min_points": 0, "benefits": ["1 point per $1 spent"], "color": "#CD7F32"},
    {"name": "Silver", "min_points": 500, "benefits": ["1.5 points per $1 spent", "Birthday bonus"], "color": "#C0C0C0"},
    {"name": "Gold", "min_points": 1500, "benefits": ["2 points per $1 spent", "Birthday bonus", "Priority booking"], "color": "#FFD700"},
    {"name": "Platinum", "min_points": 3000, "benefits": ["3 points per $1 spent", "Birthday bonus", "Priority booking", "Exclusive offers"], "color": "#E5E4E2"}
  ]'::jsonb,
  
  -- Redemption options (JSONB)
  redemption_options JSONB DEFAULT '[
    {"points": 100, "reward": "$5 off next service", "discount_amount": 500},
    {"points": 250, "reward": "$15 off next service", "discount_amount": 1500},
    {"points": 500, "reward": "$35 off next service", "discount_amount": 3500},
    {"points": 1000, "reward": "Free Classic Manicure", "discount_amount": 4500}
  ]'::jsonb,
  
  -- Rules
  points_expire_days INTEGER DEFAULT 365,
  minimum_purchase_for_points DECIMAL(10,2) DEFAULT 10.00,
  max_points_per_transaction INTEGER DEFAULT 500,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id)
);

-- 2. Create customer_loyalty_points table (customer point balances)
CREATE TABLE IF NOT EXISTS customer_loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Points balance
  total_points_earned INTEGER DEFAULT 0,
  total_points_redeemed INTEGER DEFAULT 0,
  current_balance INTEGER DEFAULT 0,
  
  -- Current tier (calculated based on total_points_earned)
  current_tier VARCHAR(50) DEFAULT 'Bronze',
  tier_progress DECIMAL(5,2) DEFAULT 0, -- Percentage to next tier
  
  -- Tracking
  last_earned_at TIMESTAMP WITH TIME ZONE,
  last_redeemed_at TIMESTAMP WITH TIME ZONE,
  
  -- Stats
  total_visits INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, customer_id)
);

-- 3. Create loyalty_transactions table (points history)
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  
  -- Transaction details
  transaction_type VARCHAR(50) NOT NULL, -- 'earned', 'redeemed', 'expired', 'bonus', 'adjustment'
  points_amount INTEGER NOT NULL, -- Positive for earned, negative for redeemed
  description TEXT,
  
  -- For earned transactions
  purchase_amount DECIMAL(10,2),
  points_multiplier DECIMAL(3,2) DEFAULT 1.0,
  
  -- For redeemed transactions  
  redemption_value DECIMAL(10,2),
  redemption_item VARCHAR(255),
  
  -- Balance tracking
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  
  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE,
  expired BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_loyalty_customer (customer_id),
  INDEX idx_loyalty_business (business_id),
  INDEX idx_loyalty_created (created_at DESC)
);

-- 4. Create function to calculate customer tier
CREATE OR REPLACE FUNCTION calculate_customer_tier(
  p_total_points INTEGER,
  p_business_id UUID
) RETURNS TABLE(
  tier_name VARCHAR(50),
  tier_progress DECIMAL(5,2),
  next_tier_points INTEGER
) AS $$
DECLARE
  v_tiers JSONB;
  v_current_tier JSONB;
  v_next_tier JSONB;
  v_tier_name VARCHAR(50);
  v_progress DECIMAL(5,2);
  v_next_points INTEGER;
BEGIN
  -- Get tier configuration from business
  SELECT reward_tiers INTO v_tiers
  FROM loyalty_programs
  WHERE business_id = p_business_id;
  
  -- Default tiers if not configured
  IF v_tiers IS NULL THEN
    v_tiers := '[
      {"name": "Bronze", "min_points": 0},
      {"name": "Silver", "min_points": 500},
      {"name": "Gold", "min_points": 1500},
      {"name": "Platinum", "min_points": 3000}
    ]'::jsonb;
  END IF;
  
  -- Find current tier
  SELECT 
    tier->>'name',
    tier
  INTO v_tier_name, v_current_tier
  FROM jsonb_array_elements(v_tiers) AS tier
  WHERE (tier->>'min_points')::INTEGER <= p_total_points
  ORDER BY (tier->>'min_points')::INTEGER DESC
  LIMIT 1;
  
  -- Find next tier
  SELECT 
    tier,
    (tier->>'min_points')::INTEGER
  INTO v_next_tier, v_next_points
  FROM jsonb_array_elements(v_tiers) AS tier
  WHERE (tier->>'min_points')::INTEGER > p_total_points
  ORDER BY (tier->>'min_points')::INTEGER ASC
  LIMIT 1;
  
  -- Calculate progress to next tier
  IF v_next_tier IS NOT NULL THEN
    v_progress := ((p_total_points - (v_current_tier->>'min_points')::INTEGER)::DECIMAL / 
                   ((v_next_tier->>'min_points')::INTEGER - (v_current_tier->>'min_points')::INTEGER)::DECIMAL) * 100;
  ELSE
    v_progress := 100; -- Max tier reached
    v_next_points := NULL;
  END IF;
  
  RETURN QUERY SELECT v_tier_name, v_progress, v_next_points;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to award loyalty points
CREATE OR REPLACE FUNCTION award_loyalty_points(
  p_business_id UUID,
  p_customer_id UUID,
  p_appointment_id UUID,
  p_purchase_amount DECIMAL(10,2),
  p_description TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_points_earned INTEGER;
  v_points_per_dollar INTEGER;
  v_current_balance INTEGER;
  v_total_earned INTEGER;
  v_tier_multiplier DECIMAL(3,2) DEFAULT 1.0;
  v_customer_tier VARCHAR(50);
BEGIN
  -- Get loyalty program settings
  SELECT points_per_dollar 
  INTO v_points_per_dollar
  FROM loyalty_programs
  WHERE business_id = p_business_id AND is_active = true;
  
  IF v_points_per_dollar IS NULL THEN
    v_points_per_dollar := 1; -- Default
  END IF;
  
  -- Get customer's current tier for multiplier
  SELECT current_tier INTO v_customer_tier
  FROM customer_loyalty_points
  WHERE business_id = p_business_id AND customer_id = p_customer_id;
  
  -- Apply tier multipliers
  CASE v_customer_tier
    WHEN 'Silver' THEN v_tier_multiplier := 1.5;
    WHEN 'Gold' THEN v_tier_multiplier := 2.0;
    WHEN 'Platinum' THEN v_tier_multiplier := 3.0;
    ELSE v_tier_multiplier := 1.0;
  END CASE;
  
  -- Calculate points earned
  v_points_earned := FLOOR(p_purchase_amount * v_points_per_dollar * v_tier_multiplier);
  
  -- Get current balance
  SELECT 
    COALESCE(current_balance, 0),
    COALESCE(total_points_earned, 0)
  INTO v_current_balance, v_total_earned
  FROM customer_loyalty_points
  WHERE business_id = p_business_id AND customer_id = p_customer_id;
  
  -- Create or update customer loyalty points
  INSERT INTO customer_loyalty_points (
    business_id, customer_id, 
    total_points_earned, current_balance,
    last_earned_at, total_visits, total_spent
  ) VALUES (
    p_business_id, p_customer_id,
    v_points_earned, v_points_earned,
    NOW(), 1, p_purchase_amount
  )
  ON CONFLICT (business_id, customer_id) DO UPDATE SET
    total_points_earned = customer_loyalty_points.total_points_earned + v_points_earned,
    current_balance = customer_loyalty_points.current_balance + v_points_earned,
    last_earned_at = NOW(),
    total_visits = customer_loyalty_points.total_visits + 1,
    total_spent = customer_loyalty_points.total_spent + p_purchase_amount,
    updated_at = NOW();
  
  -- Record transaction
  INSERT INTO loyalty_transactions (
    business_id, customer_id, appointment_id,
    transaction_type, points_amount, description,
    purchase_amount, points_multiplier,
    balance_before, balance_after,
    expires_at
  ) VALUES (
    p_business_id, p_customer_id, p_appointment_id,
    'earned', v_points_earned, 
    COALESCE(p_description, 'Points earned from purchase'),
    p_purchase_amount, v_tier_multiplier,
    v_current_balance, v_current_balance + v_points_earned,
    NOW() + INTERVAL '365 days'
  );
  
  -- Update customer tier
  PERFORM update_customer_tier(p_business_id, p_customer_id);
  
  RETURN v_points_earned;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to update customer tier
CREATE OR REPLACE FUNCTION update_customer_tier(
  p_business_id UUID,
  p_customer_id UUID
) RETURNS VOID AS $$
DECLARE
  v_total_points INTEGER;
  v_tier_info RECORD;
BEGIN
  -- Get total points earned
  SELECT total_points_earned INTO v_total_points
  FROM customer_loyalty_points
  WHERE business_id = p_business_id AND customer_id = p_customer_id;
  
  -- Calculate new tier
  SELECT * INTO v_tier_info
  FROM calculate_customer_tier(v_total_points, p_business_id);
  
  -- Update customer tier
  UPDATE customer_loyalty_points
  SET 
    current_tier = v_tier_info.tier_name,
    tier_progress = v_tier_info.tier_progress,
    updated_at = NOW()
  WHERE business_id = p_business_id AND customer_id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Create default loyalty program for Bella's Nails Studio
INSERT INTO loyalty_programs (
  business_id,
  is_active,
  program_name,
  points_per_dollar,
  points_per_visit,
  referral_points,
  birthday_bonus_points
) VALUES (
  'bb18c6ca-7e97-449d-8245-e3c28a6b6971',
  true,
  'Bella''s Rewards Club',
  1,
  10,
  50,
  100
) ON CONFLICT (business_id) DO UPDATE SET
  is_active = true,
  updated_at = NOW();

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_loyalty_programs_business ON loyalty_programs(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_business ON customer_loyalty_points(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_customer ON customer_loyalty_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_trans_customer ON loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_trans_business ON loyalty_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_trans_created ON loyalty_transactions(created_at DESC);

-- 9. Grant permissions
GRANT ALL ON loyalty_programs TO authenticated;
GRANT ALL ON customer_loyalty_points TO authenticated;
GRANT ALL ON loyalty_transactions TO authenticated;
GRANT ALL ON loyalty_programs TO anon;
GRANT ALL ON customer_loyalty_points TO anon;
GRANT ALL ON loyalty_transactions TO anon;

-- Success message
SELECT 'Loyalty system tables created successfully!' as message;