-- Verify the services table structure
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'services' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if base_price column exists specifically
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'services' 
            AND column_name = 'base_price'
            AND table_schema = 'public'
        ) 
        THEN 'YES - base_price column exists' 
        ELSE 'NO - base_price column missing' 
    END as base_price_status;

-- If base_price is missing, check if there's a 'price' column instead
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'services' 
            AND column_name = 'price'
            AND table_schema = 'public'
        ) 
        THEN 'YES - price column exists (needs renaming to base_price)' 
        ELSE 'NO - price column does not exist' 
    END as price_column_status;