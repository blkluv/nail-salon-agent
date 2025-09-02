-- Simple check for recent appointments
SELECT * FROM appointments 
ORDER BY created_at DESC 
LIMIT 3;

-- Check customers
SELECT * FROM customers 
ORDER BY created_at DESC 
LIMIT 3;

-- Get Bella's business ID
SELECT id, name, created_at FROM businesses 
WHERE name LIKE '%Bella%' 
ORDER BY created_at DESC;