-- Create all missing enums and columns for the businesses table
-- Run this in Supabase SQL Editor

-- Create missing enums (these must be created first)
CREATE TYPE IF NOT EXISTS subscription_tier AS ENUM ('starter', 'professional', 'enterprise');
CREATE TYPE IF NOT EXISTS subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing');
CREATE TYPE IF NOT EXISTS appointment_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE IF NOT EXISTS payment_status AS ENUM ('pending', 'paid', 'partially_paid', 'refunded', 'failed');
CREATE TYPE IF NOT EXISTS staff_role AS ENUM ('owner', 'manager', 'technician', 'receptionist');

-- Add missing subscription columns to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS subscription_status subscription_status DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone;

-- Add missing core columns if they don't exist
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS business_type varchar(50) DEFAULT 'nail_salon',
ADD COLUMN IF NOT EXISTS website varchar(255),
ADD COLUMN IF NOT EXISTS country varchar(100) DEFAULT 'US',
ADD COLUMN IF NOT EXISTS timezone varchar(50) DEFAULT 'America/Los_Angeles';

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND column_name IN ('subscription_tier', 'subscription_status', 'trial_ends_at', 'address_line1')
ORDER BY column_name;