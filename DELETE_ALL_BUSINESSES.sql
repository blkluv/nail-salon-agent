-- ⚠️ WARNING: This will delete ALL businesses and related data
-- Run this in Supabase SQL Editor to clean up all demo data

-- Delete all businesses (this will cascade delete all related data)
DELETE FROM businesses;

-- Verify deletion
SELECT COUNT(*) as remaining_businesses FROM businesses;

-- Also clean up any orphaned records in related tables
DELETE FROM services WHERE business_id NOT IN (SELECT id FROM businesses);
DELETE FROM staff WHERE business_id NOT IN (SELECT id FROM businesses);
DELETE FROM customers WHERE business_id NOT IN (SELECT id FROM businesses);
DELETE FROM appointments WHERE business_id NOT IN (SELECT id FROM businesses);
DELETE FROM business_hours WHERE business_id NOT IN (SELECT id FROM businesses);
DELETE FROM locations WHERE business_id NOT IN (SELECT id FROM businesses);
DELETE FROM loyalty_programs WHERE business_id NOT IN (SELECT id FROM businesses);
DELETE FROM phone_numbers WHERE business_id NOT IN (SELECT id FROM businesses);

-- Success message
SELECT 'All businesses and related data deleted successfully!' as message;