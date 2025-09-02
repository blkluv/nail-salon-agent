-- FINAL SCHEMA FIX - Match code expectations to database reality

-- 1. Fix SERVICES table - Add base_price column and sync with price_cents
ALTER TABLE services ADD COLUMN IF NOT EXISTS base_price decimal(10,2);

-- Copy price_cents to base_price (convert cents to dollars)
UPDATE services 
SET base_price = COALESCE(price_cents::decimal / 100, 0) 
WHERE base_price IS NULL;

-- Add missing services columns that the onboarding code expects
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS requires_deposit boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_amount decimal(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS service_type varchar(50),
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS max_advance_booking_days integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS min_advance_booking_hours integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}';

-- 2. Fix STAFF table - Add missing columns  
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS specialties text[],
ADD COLUMN IF NOT EXISTS hourly_rate decimal(10,2),
ADD COLUMN IF NOT EXISTS commission_rate decimal(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS hire_date date,
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add role enum and column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_role') THEN
        CREATE TYPE staff_role AS ENUM ('owner', 'manager', 'technician', 'receptionist');
    END IF;
END $$;

ALTER TABLE staff ADD COLUMN IF NOT EXISTS role staff_role DEFAULT 'technician';

-- 3. Verify critical columns exist
SELECT 
    'Services base_price: ' || 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'base_price'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

SELECT 'Schema fix completed!' as message;