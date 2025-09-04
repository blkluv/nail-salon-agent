-- Fix missing daily_reports_enabled column in businesses table
-- This addresses the schema bug causing dashboard build failures

-- Add the missing daily_reports_enabled column
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS daily_reports_enabled BOOLEAN DEFAULT true;

-- Also add other potentially missing columns for full MVP functionality
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS branding_logo_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS branding_primary_color VARCHAR(7) DEFAULT '#6366f1';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS branding_secondary_color VARCHAR(7) DEFAULT '#8b5cf6';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS branding_font_family VARCHAR(100) DEFAULT 'Inter';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS white_label_enabled BOOLEAN DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS white_label_domain VARCHAR(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS multi_location_enabled BOOLEAN DEFAULT false;

-- Add reminder settings if missing
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS reminder_hours_before INTEGER DEFAULT 24;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT true;

-- Add loyalty program settings if missing
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS loyalty_program_enabled BOOLEAN DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS loyalty_points_per_dollar DECIMAL(5,2) DEFAULT 1.00;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS loyalty_points_per_visit INTEGER DEFAULT 10;

-- Update existing businesses to have sensible defaults
UPDATE businesses 
SET 
    daily_reports_enabled = true,
    reminder_enabled = true,
    loyalty_program_enabled = (subscription_tier IN ('professional', 'business')),
    multi_location_enabled = (subscription_tier = 'business')
WHERE daily_reports_enabled IS NULL;

-- Create an index for better performance on report queries
CREATE INDEX IF NOT EXISTS idx_businesses_daily_reports ON businesses(daily_reports_enabled, subscription_tier);

COMMIT;