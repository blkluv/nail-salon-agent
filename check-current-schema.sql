-- Check current database schema state
SELECT 'Current tables:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

SELECT 'Services table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'services' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Sample services data:' as info;
SELECT id, name, price_cents, base_price FROM services LIMIT 3;