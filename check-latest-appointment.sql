-- Check for the latest appointment
SELECT 
    a.id,
    a.appointment_date,
    a.start_time,
    a.end_time,
    a.status,
    s.name as service_name,
    s.base_price,
    c.first_name,
    c.last_name,
    c.phone,
    b.name as business_name,
    b.id as business_id,
    a.created_at
FROM appointments a
LEFT JOIN services s ON a.service_id = s.id
LEFT JOIN customers c ON a.customer_id = c.id
LEFT JOIN businesses b ON a.business_id = b.id
ORDER BY a.created_at DESC
LIMIT 5;

-- Check if appointment went to correct business (Bella's)
SELECT 
    COUNT(*) as bella_appointments
FROM appointments 
WHERE business_id = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971'
AND created_at > NOW() - INTERVAL '1 hour';

-- Check all recent customers
SELECT 
    id,
    first_name,
    last_name,
    phone,
    business_id,
    created_at
FROM customers
ORDER BY created_at DESC
LIMIT 3;