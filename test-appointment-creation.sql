-- Test if we can create a simple appointment manually
-- First, check what we have to work with

-- 1. Get Bella's business details
SELECT 
    id as business_id, 
    name as business_name 
FROM businesses 
WHERE name = 'Bella''s Nails Studio';

-- 2. Check if there are any services
SELECT 
    id as service_id,
    name as service_name,
    base_price,
    business_id
FROM services 
WHERE business_id = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971'
LIMIT 3;

-- 3. Check if there are any customers  
SELECT 
    id as customer_id,
    first_name,
    last_name,
    phone,
    business_id
FROM customers 
WHERE business_id = 'bb18c6ca-7e97-449d-8245-e3c28a6b6971'
LIMIT 3;

-- 4. Check appointments table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND table_schema = 'public'
ORDER BY ordinal_position;