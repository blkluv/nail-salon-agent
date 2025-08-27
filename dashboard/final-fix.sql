-- FINAL FIX: Run this EXACT SQL in Supabase SQL Editor
-- This will create everything we need step by step

-- Step 1: Create the enums (run each one separately if needed)
CREATE TYPE subscription_tier AS ENUM ('starter', 'professional', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing');  
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partially_paid', 'refunded', 'failed');
CREATE TYPE staff_role AS ENUM ('owner', 'manager', 'technician', 'receptionist');

-- Step 2: Add the columns
ALTER TABLE businesses ADD COLUMN subscription_tier subscription_tier DEFAULT 'starter';
ALTER TABLE businesses ADD COLUMN subscription_status subscription_status DEFAULT 'trialing';
ALTER TABLE businesses ADD COLUMN trial_ends_at timestamp with time zone;
ALTER TABLE businesses ADD COLUMN business_type varchar(50) DEFAULT 'nail_salon';
ALTER TABLE businesses ADD COLUMN website varchar(255);
ALTER TABLE businesses ADD COLUMN country varchar(100) DEFAULT 'US';
ALTER TABLE businesses ADD COLUMN timezone varchar(50) DEFAULT 'America/Los_Angeles';

-- Step 3: Verify it worked
SELECT column_name FROM information_schema.columns WHERE table_name = 'businesses' AND column_name IN ('subscription_tier', 'subscription_status');