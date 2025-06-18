-- Quick Stock Check for feedBatch Precheck
-- This query exactly replicates the validation logic in feedBatch.ts

-- Usage: Replace the values below with your actual test case
-- SET @item_id = YOUR_ITEM_ID;
-- SET @required_quantity_g = YOUR_REQUIRED_QUANTITY_IN_GRAMS;

-- Example:
-- SET @item_id = 123;
-- SET @required_quantity_g = 5000; -- 5kg in grams

-- The validation logic from feedBatch.ts:
-- 1. Get available batches using getFeedBatchByItemId
-- 2. Sum their quantities
-- 3. Compare: totalAvailable < totalQtyNeeded / 1000

-- Direct replication of the validation:
SELECT 
    'FEEDBATCH PRECHECK VALIDATION' as check_type,
    @item_id as item_id,
    @required_quantity_g as required_grams,
    (@required_quantity_g / 1000.0) as required_kg,
    
    -- Get total available stock (same logic as getFeedBatchByItemId)
    COALESCE(SUM(it.quantity), 0) as total_available_kg,
    (COALESCE(SUM(it.quantity), 0) * 1000) as total_available_grams,
    
    -- The exact comparison from feedBatch.ts
    CASE 
        WHEN COALESCE(SUM(it.quantity), 0) < (@required_quantity_g / 1000.0)
        THEN 'FAIL - Not enough stock'
        ELSE 'PASS - Sufficient stock'
    END as validation_result,
    
    -- Additional debug info
    CASE 
        WHEN COALESCE(SUM(it.quantity), 0) < (@required_quantity_g / 1000.0)
        THEN CONCAT('Required: ', (@required_quantity_g / 1000.0), 'kg, Available: ', COALESCE(SUM(it.quantity), 0), 'kg')
        ELSE 'Stock validation passed'
    END as details

FROM itembatches ib
LEFT JOIN itemtransactions it ON it.batch_id = ib.id 
    AND it.location_id = 87  -- Warehouse location only
WHERE ib.item_id = @item_id
    AND (it.quantity IS NULL OR it.quantity > 0);  -- Only positive quantities (matches filter in getFeedBatchByItemId)

-- Alternative: Show batch-by-batch breakdown
/*
SELECT 
    ib.id as batch_id,
    i.name as item_name,
    COALESCE(SUM(it.quantity), 0) as available_kg,
    CASE 
        WHEN COALESCE(SUM(it.quantity), 0) > 0 
        THEN 'AVAILABLE' 
        ELSE 'NO STOCK' 
    END as status
FROM itembatches ib
JOIN items i ON i.id = ib.item_id
LEFT JOIN itemtransactions it ON it.batch_id = ib.id 
    AND it.location_id = 87
WHERE ib.item_id = @item_id
GROUP BY ib.id, i.name
ORDER BY ib.id ASC;  -- FIFO order like in getFeedBatchByItemId
*/ 