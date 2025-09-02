-- COMPLETE DATABASE SCHEMA AUDIT
-- This will show us every table and column in the database

-- 1. List all tables
SELECT '=== ALL TABLES ===' as section;
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('businesses', 'services', 'staff', 'customers', 'appointments', 
                           'business_hours', 'locations', 'loyalty_programs', 'phone_numbers')
        THEN '✅ Expected'
        ELSE '➕ Additional'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. BUSINESSES table structure
SELECT '=== BUSINESSES TABLE ===' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'businesses' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. SERVICES table structure  
SELECT '=== SERVICES TABLE ===' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'services' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. STAFF table structure
SELECT '=== STAFF TABLE ===' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'staff' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. CUSTOMERS table structure
SELECT '=== CUSTOMERS TABLE ===' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'customers' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. APPOINTMENTS table structure
SELECT '=== APPOINTMENTS TABLE ===' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. BUSINESS_HOURS table structure
SELECT '=== BUSINESS_HOURS TABLE ===' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'business_hours' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. LOCATIONS table structure
SELECT '=== LOCATIONS TABLE ===' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'locations' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. LOYALTY_PROGRAMS table structure
SELECT '=== LOYALTY_PROGRAMS TABLE ===' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'loyalty_programs' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. PHONE_NUMBERS table structure
SELECT '=== PHONE_NUMBERS TABLE ===' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'phone_numbers' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 11. Check for any ENUM types
SELECT '=== ENUM TYPES ===' as section;
SELECT 
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
GROUP BY t.typname
ORDER BY t.typname;

-- 12. Summary counts
SELECT '=== SUMMARY ===' as section;
SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tables,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public') as total_columns,
    (SELECT COUNT(*) FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e') as total_enums;