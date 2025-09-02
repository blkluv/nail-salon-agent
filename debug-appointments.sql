-- Check appointments table structure for booking issues
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if services exist for Bella's business
SELECT id, name, category, base_price, duration_minutes
FROM services 
WHERE business_id = (
    SELECT id FROM businesses 
    WHERE name = 'Bella''s Nails Studio'
    ORDER BY created_at DESC 
    LIMIT 1
);

-- Check if business_hours exist for availability checking
SELECT day_of_week, is_closed, open_time, close_time
FROM business_hours
WHERE business_id = (
    SELECT id FROM businesses 
    WHERE name = 'Bella''s Nails Studio'
    ORDER BY created_at DESC 
    LIMIT 1
)
ORDER BY day_of_week;