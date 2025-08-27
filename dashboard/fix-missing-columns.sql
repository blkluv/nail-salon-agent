-- Fix missing columns in businesses table
-- Run this in Supabase SQL Editor

-- Add missing columns to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS address_line1 varchar(255),
ADD COLUMN IF NOT EXISTS address_line2 varchar(255),
ADD COLUMN IF NOT EXISTS city varchar(100),
ADD COLUMN IF NOT EXISTS state varchar(50),
ADD COLUMN IF NOT EXISTS postal_code varchar(20),
ADD COLUMN IF NOT EXISTS country varchar(100) DEFAULT 'US',
ADD COLUMN IF NOT EXISTS timezone varchar(50) DEFAULT 'America/Los_Angeles';

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND column_name IN ('address_line1', 'city', 'state', 'postal_code')
ORDER BY column_name;