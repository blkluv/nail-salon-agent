-- ⚡ COMPREHENSIVE SCHEMA FIX - Fix ALL missing columns at once
-- Copy and paste this ENTIRE script into your Supabase SQL Editor and run it

-- ========================================
-- 1. FIX SERVICES TABLE - Add missing columns
-- ========================================
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS display_order integer,
ADD COLUMN IF NOT EXISTS service_type varchar(50),
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS max_advance_booking_days integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS min_advance_booking_hours integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}';

-- ========================================
-- 2. FIX STAFF TABLE - Add missing columns
-- ========================================
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS specialties text[],
ADD COLUMN IF NOT EXISTS hourly_rate decimal(10,2),
ADD COLUMN IF NOT EXISTS commission_rate decimal(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS hire_date date,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- ========================================
-- 3. CREATE BUSINESS_HOURS TABLE (if missing)
-- ========================================
CREATE TABLE IF NOT EXISTS business_hours (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
    day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    is_closed boolean DEFAULT false,
    open_time time,
    close_time time,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(business_id, day_of_week)
);

-- ========================================
-- 4. CREATE LOCATIONS TABLE (if missing)
-- ========================================
CREATE TABLE IF NOT EXISTS locations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    slug varchar(100) UNIQUE,
    address_line1 varchar(255),
    address_line2 varchar(255),
    city varchar(100),
    state varchar(50),
    postal_code varchar(20),
    country varchar(100) DEFAULT 'US',
    phone varchar(20),
    email varchar(255),
    timezone varchar(50) DEFAULT 'America/Los_Angeles',
    is_active boolean DEFAULT true,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ========================================
-- 5. CREATE LOYALTY_PROGRAMS TABLE (if missing)
-- ========================================
CREATE TABLE IF NOT EXISTS loyalty_programs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
    program_name varchar(255) NOT NULL,
    is_active boolean DEFAULT true,
    points_per_dollar integer DEFAULT 1,
    points_per_visit integer DEFAULT 0,
    points_expire_days integer,
    minimum_purchase_for_points decimal(10,2) DEFAULT 0,
    reward_tiers jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ========================================
-- 6. CREATE PHONE_NUMBERS TABLE (if missing)
-- ========================================
CREATE TABLE IF NOT EXISTS phone_numbers (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
    phone_number varchar(20) NOT NULL,
    vapi_phone_id varchar(255),
    vapi_phone_number_id varchar(255),
    is_primary boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ========================================
-- 7. FIX ENUM TYPES - Add missing values
-- ========================================

-- Add 'business' tier to subscription_tier enum if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e 
        JOIN pg_type t ON e.enumtypid = t.oid 
        WHERE t.typname = 'subscription_tier' 
        AND e.enumlabel = 'business'
    ) THEN
        ALTER TYPE subscription_tier ADD VALUE 'business';
    END IF;
END $$;

-- Create staff_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_role') THEN
        CREATE TYPE staff_role AS ENUM ('owner', 'manager', 'technician', 'receptionist');
    END IF;
END $$;

-- ========================================
-- 8. FIX STAFF TABLE ROLE COLUMN (if needed)
-- ========================================
-- Check if staff.role exists and is the right type
DO $$ 
BEGIN
    -- Add role column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE staff ADD COLUMN role staff_role DEFAULT 'technician';
    END IF;
END $$;

-- ========================================
-- 9. FIX SERVICES TABLE AGAIN (ensure base_price exists)
-- ========================================
-- Sometimes the column exists but cache is stale
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS base_price decimal(10,2);

-- If base_price already exists but as wrong type, fix it
DO $$ 
BEGIN
    -- Check if we need to convert price to base_price
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'price'
        AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'services' 
            AND column_name = 'base_price'
        )
    ) THEN
        ALTER TABLE services RENAME COLUMN price TO base_price;
    END IF;
END $$;

-- ========================================
-- 10. FIX BUSINESSES TABLE - Ensure all columns exist
-- ========================================
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS slug varchar(100),
ADD COLUMN IF NOT EXISTS business_type varchar(50) DEFAULT 'nail_salon',
ADD COLUMN IF NOT EXISTS subscription_tier varchar(50) DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS subscription_status varchar(50) DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- ========================================
-- VERIFICATION - Check all tables exist
-- ========================================
SELECT 
    'Tables Created/Fixed' as status,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'businesses', 
    'services', 
    'staff', 
    'business_hours', 
    'locations', 
    'loyalty_programs',
    'phone_numbers'
);

-- Show current services table structure
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'services' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
SELECT 'Schema fix completed successfully! All tables and columns should now be ready.' as message;