-- Migration: Add customer-business relationship tracking
-- This enables phone-based business discovery for multi-business support

-- Create customer_business_relationships table
CREATE TABLE IF NOT EXISTS customer_business_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    first_visit_date DATE,
    last_visit_date DATE,
    total_visits INTEGER DEFAULT 0,
    is_preferred BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate relationships
    UNIQUE(customer_id, business_id)
);

-- Create indexes for performance
CREATE INDEX idx_cbr_customer_id ON customer_business_relationships(customer_id);
CREATE INDEX idx_cbr_business_id ON customer_business_relationships(business_id);
CREATE INDEX idx_cbr_is_preferred ON customer_business_relationships(is_preferred);

-- Update customers table to have phone unique across system (not per business)
-- First, we need to handle any existing duplicate phone numbers
-- This query identifies duplicates that would need to be resolved
DO $$
BEGIN
    -- Check if unique constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'customers_phone_unique'
    ) THEN
        -- Add unique constraint on phone
        ALTER TABLE customers ADD CONSTRAINT customers_phone_unique UNIQUE(phone);
    END IF;
END $$;

-- Create function to automatically manage customer-business relationships
CREATE OR REPLACE FUNCTION manage_customer_business_relationship()
RETURNS TRIGGER AS $$
BEGIN
    -- When a new appointment is created, ensure relationship exists
    INSERT INTO customer_business_relationships (
        customer_id,
        business_id,
        first_visit_date,
        last_visit_date,
        total_visits
    )
    VALUES (
        NEW.customer_id,
        NEW.business_id,
        NEW.appointment_date,
        NEW.appointment_date,
        1
    )
    ON CONFLICT (customer_id, business_id) 
    DO UPDATE SET
        last_visit_date = EXCLUDED.last_visit_date,
        total_visits = customer_business_relationships.total_visits + 1,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update relationships on appointment creation
CREATE TRIGGER update_customer_business_relationship
    AFTER INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION manage_customer_business_relationship();

-- Create view for easy customer-business lookup
CREATE OR REPLACE VIEW customer_businesses AS
SELECT 
    c.id as customer_id,
    c.phone,
    c.first_name,
    c.last_name,
    c.email,
    cbr.business_id,
    b.name as business_name,
    b.slug as business_slug,
    cbr.first_visit_date,
    cbr.last_visit_date,
    cbr.total_visits,
    cbr.is_preferred,
    cbr.notes
FROM customers c
JOIN customer_business_relationships cbr ON c.id = cbr.customer_id
JOIN businesses b ON cbr.business_id = b.id
WHERE b.subscription_status = 'active'
ORDER BY cbr.is_preferred DESC, cbr.last_visit_date DESC;

-- Grant permissions
GRANT SELECT ON customer_business_relationships TO anon, authenticated;
GRANT ALL ON customer_business_relationships TO service_role;
GRANT SELECT ON customer_businesses TO anon, authenticated, service_role;

-- Enable RLS
ALTER TABLE customer_business_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role full access" ON customer_business_relationships
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anonymous can read relationships" ON customer_business_relationships
    FOR SELECT USING (TRUE);

-- Function to find businesses for a phone number
CREATE OR REPLACE FUNCTION find_businesses_for_phone(phone_number TEXT)
RETURNS TABLE (
    business_id UUID,
    business_name TEXT,
    business_slug TEXT,
    is_preferred BOOLEAN,
    last_visit_date DATE,
    total_visits INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cb.business_id,
        cb.business_name::TEXT,
        cb.business_slug::TEXT,
        cb.is_preferred,
        cb.last_visit_date,
        cb.total_visits
    FROM customer_businesses cb
    WHERE cb.phone = phone_number
    ORDER BY cb.is_preferred DESC, cb.last_visit_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on function
GRANT EXECUTE ON FUNCTION find_businesses_for_phone TO anon, authenticated, service_role;