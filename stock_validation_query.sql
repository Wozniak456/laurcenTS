-- Stock Validation Query for feedBatch Precheck Debugging
-- This query replicates the logic used in getFeedBatchByItemId function

-- Replace @item_id with the actual item_id you're testing
-- Replace @required_quantity_kg with the quantity needed in kg

-- Example usage:
-- SET @item_id = 123;
-- SET @required_quantity_kg = 5.0;

-- Step 1: Find all batches for the item
WITH item_batches AS (
    SELECT 
        ib.id as batch_id,
        ib.item_id,
        i.name as item_name,
        ib.price
    FROM itembatches ib
    JOIN items i ON i.id = ib.item_id
    WHERE ib.item_id = @item_id  -- Replace with actual item_id
),

-- Step 2: Calculate available stock for each batch at warehouse (location_id = 87)
batch_stock AS (
    SELECT 
        ib.batch_id,
        ib.item_name,
        ib.price,
        COALESCE(SUM(it.quantity), 0) as available_quantity_kg
    FROM item_batches ib
    LEFT JOIN itemtransactions it ON it.batch_id = ib.batch_id 
        AND it.location_id = 87  -- Warehouse location
    GROUP BY ib.batch_id, ib.item_name, ib.price
),

-- Step 3: Filter batches with positive stock and order by batch_id (FIFO)
available_batches AS (
    SELECT 
        batch_id,
        item_name,
        price,
        available_quantity_kg
    FROM batch_stock
    WHERE available_quantity_kg > 0
    ORDER BY batch_id ASC  -- This matches the logic in getFeedBatchByItemId
),

-- Step 4: Calculate cumulative available stock
cumulative_stock AS (
    SELECT 
        batch_id,
        item_name,
        price,
        available_quantity_kg,
        SUM(available_quantity_kg) OVER (ORDER BY batch_id) as cumulative_quantity_kg
    FROM available_batches
)

-- Final result showing stock validation
SELECT 
    'STOCK VALIDATION SUMMARY' as info,
    @item_id as item_id,
    @required_quantity_kg as required_quantity_kg,
    (SELECT COALESCE(SUM(available_quantity_kg), 0) FROM available_batches) as total_available_kg,
    CASE 
        WHEN (SELECT COALESCE(SUM(available_quantity_kg), 0) FROM available_batches) >= @required_quantity_kg 
        THEN 'SUFFICIENT' 
        ELSE 'INSUFFICIENT' 
    END as validation_result

UNION ALL

SELECT 
    'DETAILED BATCH BREAKDOWN' as info,
    NULL as item_id,
    NULL as required_quantity_kg,
    NULL as total_available_kg,
    NULL as validation_result

UNION ALL

SELECT 
    CONCAT('Batch ', batch_id, ' (', item_name, ')') as info,
    batch_id as item_id,
    available_quantity_kg as required_quantity_kg,
    cumulative_quantity_kg as total_available_kg,
    CASE 
        WHEN cumulative_quantity_kg >= @required_quantity_kg 
        THEN 'ENOUGH' 
        ELSE 'NEED MORE' 
    END as validation_result
FROM cumulative_stock

UNION ALL

SELECT 
    'TRANSACTION HISTORY FOR DEBUGGING' as info,
    NULL as item_id,
    NULL as required_quantity_kg,
    NULL as total_available_kg,
    NULL as validation_result

UNION ALL

-- Show recent transactions for this item's batches
SELECT 
    CONCAT('Tran ', it.id, ' - Batch ', it.batch_id) as info,
    it.batch_id as item_id,
    it.quantity as required_quantity_kg,
    NULL as total_available_kg,
    CONCAT('Doc ', it.doc_id, ' - ', d.date_time) as validation_result
FROM itemtransactions it
JOIN documents d ON d.id = it.doc_id
JOIN item_batches ib ON ib.batch_id = it.batch_id
WHERE it.location_id = 87  -- Warehouse transactions only
ORDER BY d.date_time DESC, it.id DESC
LIMIT 20;

-- Alternative simplified query for quick check:
/*
SELECT 
    @item_id as item_id,
    @required_quantity_kg as required_kg,
    COALESCE(SUM(it.quantity), 0) as available_kg,
    CASE 
        WHEN COALESCE(SUM(it.quantity), 0) >= @required_quantity_kg 
        THEN 'SUFFICIENT' 
        ELSE 'INSUFFICIENT' 
    END as result
FROM itembatches ib
LEFT JOIN itemtransactions it ON it.batch_id = ib.id 
    AND it.location_id = 87
WHERE ib.item_id = @item_id;
*/ 