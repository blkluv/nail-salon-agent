-- UNIFIED PRICING SOLUTION
-- Adds base_price column while maintaining price_cents for compatibility

-- 1. Add base_price column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS base_price decimal(10,2);

-- 2. Convert existing price_cents to base_price (cents to dollars)
UPDATE services 
SET base_price = COALESCE(price_cents::decimal / 100, 0) 
WHERE base_price IS NULL;

-- 3. Add constraints to keep both fields in sync
-- Create a trigger function to keep price_cents and base_price synchronized
CREATE OR REPLACE FUNCTION sync_service_pricing()
RETURNS TRIGGER AS $$
BEGIN
    -- If base_price was updated, update price_cents
    IF OLD.base_price IS DISTINCT FROM NEW.base_price THEN
        NEW.price_cents = ROUND(NEW.base_price * 100);
    -- If price_cents was updated, update base_price
    ELSIF OLD.price_cents IS DISTINCT FROM NEW.price_cents THEN
        NEW.base_price = NEW.price_cents::decimal / 100;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to maintain synchronization
DROP TRIGGER IF EXISTS sync_pricing_trigger ON services;
CREATE TRIGGER sync_pricing_trigger
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION sync_service_pricing();

-- 5. Add missing onboarding columns to services
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS requires_deposit boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_amount decimal(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS service_type varchar(50),
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS max_advance_booking_days integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS min_advance_booking_hours integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}';

-- 6. Update deposit logic based on base_price
UPDATE services 
SET 
    requires_deposit = (base_price >= 75),
    deposit_amount = CASE 
        WHEN base_price >= 75 THEN ROUND(base_price * 0.25, 2)
        ELSE 0.00 
    END
WHERE requires_deposit IS NULL OR deposit_amount = 0.00;

-- 7. Verify the fix worked
SELECT 'Schema unified successfully!' as message;

-- Show sample data to confirm both fields work
SELECT 
    name,
    base_price,
    price_cents,
    requires_deposit,
    deposit_amount
FROM services 
LIMIT 3;