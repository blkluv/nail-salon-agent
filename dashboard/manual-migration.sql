-- Maya Job and Branding Fields Migration
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Copy and paste the entire script below and click "Run"

-- Add Maya job selection field
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS maya_job_id text;

-- Add Business tier branding fields  
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS brand_personality text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS business_description text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS unique_selling_points jsonb DEFAULT '[]'::jsonb;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS target_customer text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS price_range text;

-- Add agent tracking fields (for VAPI integration)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS agent_id text; -- VAPI agent ID
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS agent_type text; -- shared-job-specific or custom-business  
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS phone_number text; -- Dedicated AI phone number

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_businesses_maya_job_id ON businesses(maya_job_id);
CREATE INDEX IF NOT EXISTS idx_businesses_subscription_agent ON businesses(subscription_tier, agent_type);

-- Add check constraints for data integrity
ALTER TABLE businesses ADD CONSTRAINT IF NOT EXISTS chk_brand_personality 
  CHECK (brand_personality IS NULL OR brand_personality IN ('professional', 'warm', 'luxury', 'casual'));
  
ALTER TABLE businesses ADD CONSTRAINT IF NOT EXISTS chk_price_range
  CHECK (price_range IS NULL OR price_range IN ('budget', 'mid-range', 'premium', 'luxury'));
  
ALTER TABLE businesses ADD CONSTRAINT IF NOT EXISTS chk_agent_type
  CHECK (agent_type IS NULL OR agent_type IN ('shared-job-specific', 'custom-business'));

-- Add comments for documentation  
COMMENT ON COLUMN businesses.maya_job_id IS 'Selected Maya job role (nail-salon-receptionist, hair-salon-coordinator, etc.)';
COMMENT ON COLUMN businesses.brand_personality IS 'Business tier brand personality for custom agent creation';
COMMENT ON COLUMN businesses.unique_selling_points IS 'JSON array of unique selling points for business';
COMMENT ON COLUMN businesses.agent_id IS 'VAPI assistant ID for this business';
COMMENT ON COLUMN businesses.agent_type IS 'Type of agent: shared-job-specific or custom-business';
COMMENT ON COLUMN businesses.phone_number IS 'Dedicated AI phone number for this business';