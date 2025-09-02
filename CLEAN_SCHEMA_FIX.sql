-- Run this entire SQL in Supabase SQL Editor

-- Fix staff table
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS specialties text[],
ADD COLUMN IF NOT EXISTS hourly_rate decimal(10,2),
ADD COLUMN IF NOT EXISTS commission_rate decimal(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS hire_date date,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create business_hours table
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

-- Create locations table
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

-- Create loyalty_programs table
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

-- Create phone_numbers table
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

-- Create staff_role enum if needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_role') THEN
        CREATE TYPE staff_role AS ENUM ('owner', 'manager', 'technician', 'receptionist');
    END IF;
END $$;

-- Add role column to staff if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE staff ADD COLUMN role staff_role DEFAULT 'technician';
    END IF;
END $$;

-- Success message
SELECT 'All schema fixes completed successfully!' as message;