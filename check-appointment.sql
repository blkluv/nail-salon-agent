-- Check if the appointment was created successfully
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
    a.created_at
FROM appointments a
LEFT JOIN services s ON a.service_id = s.id
LEFT JOIN customers c ON a.customer_id = c.id
LEFT JOIN businesses b ON a.business_id = b.id
WHERE b.name = 'Bella''s Nails Studio'
ORDER BY a.created_at DESC
LIMIT 5;

-- Also check customers table
SELECT 
    id,
    first_name,
    last_name, 
    phone,
    email,
    created_at
FROM customers 
WHERE business_id = (
    SELECT id FROM businesses 
    WHERE name = 'Bella''s Nails Studio'
)
ORDER BY created_at DESC
LIMIT 3;