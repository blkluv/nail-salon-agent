-- Create Professional Tier Demo Business
-- Run this in Supabase SQL editor

BEGIN;

-- Step 1: Insert demo business
INSERT INTO businesses (
    id,
    slug,
    name,
    email,
    owner_first_name,
    owner_last_name,
    owner_email,
    phone,
    address,
    city,
    state,
    zip_code,
    business_type,
    plan_type,
    subscription_status,
    vapi_phone_number,
    vapi_assistant_id,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'luxe-beauty-pro-demo',
    'Luxe Beauty Pro Demo',
    'demo.pro@luxebeauty.com',
    'Demo',
    'Professional Owner',
    'demo.pro@luxebeauty.com',
    '+1-555-PRO-DEMO',
    '123 Professional Ave',
    'Beauty City',
    'BC',
    '12345',
    'premium_beauty_salon',
    'professional',
    'active',
    '+1-424-351-9304',
    '8ab7e000-aea8-4141-a471-33133219a471',
    NOW(),
    NOW()
);

-- Step 2: Insert premium services
INSERT INTO services (id, business_id, name, description, duration_minutes, price_cents, category, is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Premium Manicure', 'Luxury manicure with premium polish', 45, 6500, 'manicure', true, NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Deluxe Pedicure', 'Relaxing pedicure with spa treatment', 60, 8500, 'pedicure', true, NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Gel Extensions', 'Long-lasting gel nail extensions', 90, 12000, 'extensions', true, NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Nail Art Design', 'Custom artistic nail designs', 75, 15000, 'nail_art', true, NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Hand & Foot Spa Treatment', 'Complete spa experience for hands and feet', 120, 18000, 'spa', true, NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Bridal Nail Package', 'Complete bridal nail and beauty package', 150, 25000, 'special', true, NOW(), NOW());

-- Step 3: Insert demo customers
INSERT INTO customers (id, business_id, first_name, last_name, phone, email, notes, created_at, updated_at) VALUES
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Sarah', 'Johnson', '+1-555-CUST-001', 'sarah.j@email.com', 'VIP customer - prefers gel extensions', NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Emily', 'Davis', '+1-555-CUST-002', 'emily.d@email.com', 'Regular customer - loves nail art', NOW(), NOW()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Michelle', 'Brown', '+1-555-CUST-003', 'michelle.b@email.com', 'New customer - interested in spa treatments', NOW(), NOW());

-- Step 4: Insert demo appointments (get service and customer IDs first)
WITH service_ids AS (
    SELECT id as service_id, name 
    FROM services 
    WHERE business_id = '00000000-0000-0000-0000-000000000001'
),
customer_ids AS (
    SELECT id as customer_id, first_name, last_name, phone, email
    FROM customers 
    WHERE business_id = '00000000-0000-0000-0000-000000000001'
)
INSERT INTO appointments (
    id, business_id, customer_id, service_id, 
    appointment_date, start_time, end_time, duration_minutes,
    status, customer_name, customer_phone, customer_email,
    customer_notes, booking_source, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    c.customer_id,
    s.service_id,
    (CURRENT_DATE + INTERVAL '1 day')::date,
    '10:00:00'::time,
    '10:45:00'::time,
    45,
    'confirmed',
    c.first_name || ' ' || c.last_name,
    c.phone,
    c.email,
    'Please use light pink color',
    'phone',
    NOW(),
    NOW()
FROM customer_ids c, service_ids s 
WHERE c.first_name = 'Sarah' AND s.name = 'Premium Manicure'
UNION ALL
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    c.customer_id,
    s.service_id,
    (CURRENT_DATE + INTERVAL '1 day')::date,
    '14:00:00'::time,
    '15:15:00'::time,
    75,
    'confirmed',
    c.first_name || ' ' || c.last_name,
    c.phone,
    c.email,
    'Floral design requested',
    'web',
    NOW(),
    NOW()
FROM customer_ids c, service_ids s 
WHERE c.first_name = 'Emily' AND s.name = 'Nail Art Design';

COMMIT;

-- Verify the data was created
SELECT 'Demo business created successfully!' as status;
SELECT name, plan_type, subscription_status FROM businesses WHERE id = '00000000-0000-0000-0000-000000000001';
SELECT COUNT(*) as services_count FROM services WHERE business_id = '00000000-0000-0000-0000-000000000001';
SELECT COUNT(*) as customers_count FROM customers WHERE business_id = '00000000-0000-0000-0000-000000000001';
SELECT COUNT(*) as appointments_count FROM appointments WHERE business_id = '00000000-0000-0000-0000-000000000001';