-- Check for appointments created in the last 2 hours
SELECT 
    a.id,
    a.created_at,
    a.appointment_date,
    a.start_time,
    a.status,
    s.name as service_name,
    s.base_price,
    c.first_name,
    c.last_name,
    c.phone,
    b.name as business_name,
    b.id as business_id
FROM appointments a
LEFT JOIN services s ON a.service_id = s.id
LEFT JOIN customers c ON a.customer_id = c.id
LEFT JOIN businesses b ON a.business_id = b.id
WHERE a.created_at > NOW() - INTERVAL '2 hours'
ORDER BY a.created_at DESC;

-- Check for customers created in the last 2 hours
SELECT 
    id,
    first_name,
    last_name,
    phone,
    business_id,
    created_at
FROM customers
WHERE created_at > NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;

-- Check which business ID the webhook is using
SELECT 
    id,
    name,
    created_at
FROM businesses
ORDER BY created_at DESC
LIMIT 3;