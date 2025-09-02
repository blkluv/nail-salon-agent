-- Check if the old hardcoded business ID has appointments
SELECT COUNT(*) as appointment_count 
FROM appointments 
WHERE business_id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';

-- Check what business this old ID points to
SELECT id, name, created_at 
FROM businesses 
WHERE id = '8424aa26-4fd5-4d4b-92aa-8a9c5ba77dad';

-- Check if any appointments were created recently (last hour)
SELECT 
    id,
    business_id,
    customer_name,
    customer_phone,
    appointment_date,
    start_time,
    created_at
FROM appointments 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;