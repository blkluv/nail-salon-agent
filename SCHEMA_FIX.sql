-- ⚡ URGENT: Fix missing columns in businesses table
-- Copy and paste this into your Supabase SQL Editor and run it

-- Add all missing columns to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS country varchar(100) DEFAULT 'US';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS timezone varchar(50) DEFAULT 'America/Los_Angeles';
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS address_line1 varchar(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS address_line2 varchar(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS city varchar(100);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS state varchar(50);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS postal_code varchar(20);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_assistant_id varchar(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_phone_number_id varchar(255);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_phone_number varchar(20);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS vapi_configured boolean DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}';

-- Also ensure we have the business subscription tier enum updated
DO $$ BEGIN
    -- Add 'business' tier if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
        CREATE TYPE subscription_tier AS ENUM ('starter', 'professional', 'business', 'enterprise');
    ELSE
        -- Check if 'business' tier exists, add if not
        IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'subscription_tier' AND e.enumlabel = 'business') THEN
            ALTER TYPE subscription_tier ADD VALUE 'business';
        END IF;
    END IF;
END $$;

-- Verify the fix worked
SELECT 'Schema fix completed! ✅' as status;

-- Show current businesses table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND table_schema = 'public'
ORDER BY column_name;