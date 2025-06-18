-- Precheck Stock Validation Query for checkStockBeforeFeed Function
-- This query exactly replicates the logic used in checkStockBeforeFeed function
-- FIXED: Now checks warehouse location (87) instead of pool location

-- Usage: Replace the values below with your actual test case
-- SET @location_id = YOUR_LOCATION_ID; (pool location - for reference only)
-- SET @item_id = YOUR_ITEM_ID;
-- SET @required_quantities = '{"time_6": 1000, "time_12": 2000, "time_18": 1500}'; -- JSON string of quantities

-- Example:
-- SET @location_id = 40; -- Pool location (for reference)
-- SET @item_id = 123;
-- SET @required_quantities = '{"time_6": 1000, "time_12": 2000, "time_18": 1500}';

-- The validation logic from checkStockBeforeFeed (FIXED):
-- 1. Sum all planned quantities (convert to kg if needed)
-- 2. Find all batches for this item
-- 3. Sum available stock for these batches at WAREHOUSE location (87) - FIXED
-- 4. Compare: available < totalQuantity

-- Parse the JSON quantities (you'll need to replace this with actual values)
-- For this example, let's assume we have the quantities directly
-- SET @total_quantity_g = 4500; -- Sum of all quantities in grams
-- SET @total_quantity_kg = 4.5; -- Converted to kg

-- Direct replication of the validation (FIXED):
WITH 
-- Step 1: Parse quantities (replace with your actual values)
quantities AS (
    SELECT 
        @location_id as pool_location_id, -- For reference only
        @item_id as item_id,
        -- Replace these with your actual quantities
        1000 as time_6_qty,
        2000 as time_12_qty, 
        1500 as time_18_qty
        -- Add more time slots as needed
),

-- Step 2: Calculate total quantity needed
total_needed AS (
    SELECT 
        pool_location_id,
        item_id,
        (time_6_qty + time_12_qty + time_18_qty) as total_grams,
        (time_6_qty + time_12_qty + time_18_qty) / 1000.0 as total_kg
    FROM quantities
),

-- Step 3: Find all batches for this item
item_batches AS (
    SELECT 
        ib.id as batch_id,
        ib.item_id,
        i.name as item_name
    FROM itembatches ib
    JOIN items i ON i.id = ib.item_id
    WHERE ib.item_id = @item_id
),

-- Step 4: Calculate available stock for these batches at WAREHOUSE location (87) - FIXED
batch_stock AS (
    SELECT 
        ib.batch_id,
        ib.item_name,
        COALESCE(SUM(it.quantity), 0) as available_kg
    FROM item_batches ib
    LEFT JOIN itemtransactions it ON it.batch_id = ib.batch_id 
        AND it.location_id = 87  -- WAREHOUSE location - FIXED
    GROUP BY ib.batch_id, ib.item_name
),

-- Step 5: Calculate total available stock
total_available AS (
    SELECT 
        COALESCE(SUM(available_kg), 0) as total_available_kg
    FROM batch_stock
)

-- Final validation result
SELECT 
    'PRECHECK VALIDATION SUMMARY (FIXED)' as info,
    tn.pool_location_id as pool_location_id,
    @item_id as item_id,
    tn.total_kg as required_kg,
    tn.total_grams as required_grams,
    ta.total_available_kg as available_kg,
    (ta.total_available_kg * 1000) as available_grams,
    CASE 
        WHEN ta.total_available_kg < tn.total_kg 
        THEN 'FAIL - Not enough stock at warehouse'
        ELSE 'PASS - Sufficient stock at warehouse'
    END as validation_result,
    CASE 
        WHEN ta.total_available_kg < tn.total_kg 
        THEN CONCAT('Required: ', tn.total_kg, 'kg, Available at warehouse: ', ta.total_available_kg, 'kg')
        ELSE 'Stock validation passed'
    END as details
FROM total_needed tn
CROSS JOIN total_available ta

UNION ALL

SELECT 
    'DETAILED BREAKDOWN (WAREHOUSE STOCK)' as info,
    NULL as pool_location_id,
    NULL as item_id,
    NULL as required_kg,
    NULL as required_grams,
    NULL as available_kg,
    NULL as available_grams,
    NULL as validation_result,
    NULL as details

UNION ALL

-- Show individual batch stock at warehouse
SELECT 
    CONCAT('Batch ', bs.batch_id, ' (', bs.item_name, ')') as info,
    NULL as pool_location_id,
    bs.batch_id as item_id,
    NULL as required_kg,
    NULL as required_grams,
    bs.available_kg as available_kg,
    (bs.available_kg * 1000) as available_grams,
    CASE 
        WHEN bs.available_kg > 0 
        THEN 'AVAILABLE AT WAREHOUSE' 
        ELSE 'NO STOCK AT WAREHOUSE' 
    END as validation_result,
    'Warehouse (87) stock' as details
FROM batch_stock bs

UNION ALL

SELECT 
    'TRANSACTION HISTORY FOR DEBUGGING (WAREHOUSE)' as info,
    NULL as pool_location_id,
    NULL as item_id,
    NULL as required_kg,
    NULL as required_grams,
    NULL as available_kg,
    NULL as available_grams,
    NULL as validation_result,
    NULL as details

UNION ALL

-- Show recent transactions for this item's batches at warehouse location
SELECT 
    CONCAT('Tran ', it.id, ' - Batch ', it.batch_id) as info,
    it.location_id as pool_location_id,
    it.batch_id as item_id,
    it.quantity as required_kg,
    (it.quantity * 1000) as required_grams,
    NULL as available_kg,
    NULL as available_grams,
    CONCAT('Doc ', it.doc_id, ' - ', d.date_time) as validation_result,
    CONCAT('Quantity: ', it.quantity, 'kg') as details
FROM itemtransactions it
JOIN documents d ON d.id = it.doc_id
JOIN item_batches ib ON ib.batch_id = it.batch_id
WHERE it.location_id = 87  -- WAREHOUSE location - FIXED
ORDER BY d.date_time DESC, it.id DESC
LIMIT 20;

-- Alternative simplified query for quick check (FIXED):
/*
SELECT 
    @location_id as pool_location_id,
    @item_id as item_id,
    4.5 as required_kg, -- Replace with your actual required kg
    COALESCE(SUM(it.quantity), 0) as available_kg,
    CASE 
        WHEN COALESCE(SUM(it.quantity), 0) < 4.5 
        THEN 'FAIL - Not enough stock at warehouse'
        ELSE 'PASS - Sufficient stock at warehouse'
    END as result
FROM itembatches ib
LEFT JOIN itemtransactions it ON it.batch_id = ib.id 
    AND it.location_id = 87  -- WAREHOUSE location - FIXED
WHERE ib.item_id = @item_id;
*/ 