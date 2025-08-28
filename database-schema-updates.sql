-- ============================================
-- Customer Self-Service Portal & Analytics Backend
-- Database Schema Updates
-- ============================================

-- 1. Customer verification codes for SMS login
CREATE TABLE IF NOT EXISTS customer_verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    customer_phone TEXT NOT NULL,
    verification_code TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_verification_phone_business ON customer_verification_codes(customer_phone, business_id);
CREATE INDEX IF NOT EXISTS idx_customer_verification_expires ON customer_verification_codes(expires_at);

-- 2. Customer sessions for portal access
CREATE TABLE IF NOT EXISTS customer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    device_info JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_accessed_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customer_sessions_token ON customer_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_customer ON customer_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_expires ON customer_sessions(expires_at);

-- 3. Enhanced Customer Table - Add customer portal and analytics fields
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"notifications": true, "email_marketing": true, "sms_reminders": true}',
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS portal_last_login TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS portal_login_count INTEGER DEFAULT 0;

-- Update existing customers to have default preferences
UPDATE customers
SET preferences = '{"notifications": true, "email_marketing": true, "sms_reminders": true}'
WHERE preferences IS NULL;

-- 4. Analytics events for detailed tracking
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'appointment_booked', 'payment_processed', 'customer_login', etc.
    event_data JSONB NOT NULL DEFAULT '{}',
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    session_id UUID NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_business_type_date ON analytics_events(business_id, event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_customer_date ON analytics_events(customer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_appointment ON analytics_events(appointment_id);

-- 5. Customer portal activities
CREATE TABLE IF NOT EXISTS customer_portal_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'login', 'view_appointments', 'reschedule', 'cancel', 'update_profile'
    activity_data JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_activities_customer_date ON customer_portal_activities(customer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_portal_activities_business_date ON customer_portal_activities(business_id, created_at);

-- 6. Business phone numbers for multi-tenant SMS
CREATE TABLE IF NOT EXISTS business_phone_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    provider TEXT DEFAULT 'twilio',
    provider_sid TEXT,
    provider_token TEXT,
    is_voice_enabled BOOLEAN DEFAULT TRUE,
    is_sms_enabled BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(business_id, phone_number)
);

CREATE INDEX IF NOT EXISTS idx_business_phone_primary ON business_phone_numbers(business_id, is_primary);

-- 7. Insert default phone number configuration for demo business
INSERT INTO business_phone_numbers (
    business_id,
    phone_number,
    provider,
    is_voice_enabled,
    is_sms_enabled,
    is_primary
) VALUES (
    '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad',
    '+14243519304',
    'twilio',
    true,
    true,
    true
) ON CONFLICT (business_id, phone_number) DO NOTHING;

-- ============================================
-- Verification Queries
-- ============================================

-- Check that all tables were created successfully
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_catalog.pg_tables 
WHERE tablename IN (
    'customer_verification_codes',
    'customer_sessions', 
    'analytics_events',
    'customer_portal_activities',
    'business_phone_numbers'
)
ORDER BY tablename;

-- Check that customer table was updated
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name IN ('preferences', 'email_verified', 'phone_verified', 'portal_last_login', 'portal_login_count')
ORDER BY column_name;

-- Check that indexes were created
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE indexname LIKE 'idx_%customer%' OR indexname LIKE 'idx_%analytics%' OR indexname LIKE 'idx_%portal%'
ORDER BY tablename, indexname;