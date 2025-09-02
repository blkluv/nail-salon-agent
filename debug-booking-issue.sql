-- Check if any appointments exist at all
SELECT COUNT(*) as total_appointments FROM appointments;

-- Check if any customers exist
SELECT COUNT(*) as total_customers FROM customers;

-- Check what business ID the webhook is using
SELECT id, name, created_at FROM businesses ORDER BY created_at DESC LIMIT 1;

-- Check if services exist for Bella's business
SELECT id, name, business_id FROM services 
WHERE business_id = (
    SELECT id FROM businesses 
    WHERE name LIKE '%Bella%' 
    ORDER BY created_at DESC 
    LIMIT 1
);