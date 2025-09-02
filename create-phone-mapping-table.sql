-- Create phone_business_mapping table for multi-tenant routing
CREATE TABLE IF NOT EXISTS phone_business_mapping (
    phone_number TEXT PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast business lookups
CREATE INDEX IF NOT EXISTS idx_phone_business_mapping_business_id 
ON phone_business_mapping(business_id);

-- Create index for active phone numbers
CREATE INDEX IF NOT EXISTS idx_phone_business_mapping_active 
ON phone_business_mapping(phone_number, is_active) WHERE is_active = true;

-- Insert mapping for existing demo number
INSERT INTO phone_business_mapping (phone_number, business_id)
VALUES ('+14243519304', 'bb18c6ca-7e97-449d-8245-e3c28a6b6971')
ON CONFLICT (phone_number) DO UPDATE SET 
    business_id = EXCLUDED.business_id,
    updated_at = NOW();

-- Verify the mapping
SELECT 
    pbm.phone_number,
    b.name as business_name,
    b.id as business_id,
    pbm.is_active,
    pbm.created_at
FROM phone_business_mapping pbm
JOIN businesses b ON pbm.business_id = b.id
ORDER BY pbm.created_at DESC;