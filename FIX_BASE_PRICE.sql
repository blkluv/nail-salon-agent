-- Fix the services table column name issue

-- Option 1: If 'price' column exists but 'base_price' doesn't, rename it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'price'
        AND table_schema = 'public'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'base_price'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE services RENAME COLUMN price TO base_price;
        RAISE NOTICE 'Renamed price to base_price';
    END IF;
END $$;

-- Option 2: If neither exists, add base_price
ALTER TABLE services ADD COLUMN IF NOT EXISTS base_price decimal(10,2);

-- Verify the fix
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'services' 
AND column_name IN ('price', 'base_price')
AND table_schema = 'public';

-- Success message
SELECT 'base_price column is now available!' as status;