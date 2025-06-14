-- Migrate priorities data
INSERT INTO "priority_history" (
    "location_id",
    "item_id",
    "priority",
    "valid_from",
    "created_by"
)
SELECT 
    location_id,
    item_id,
    priority,
    '2025-03-01 00:00:00'::timestamp,
    3  -- Default employee_id as integer
FROM priorities;

-- Migrate percent_feeding data
INSERT INTO "percent_feeding_history" (
    "pool_id",
    "percent_feeding",
    "valid_from",
    "created_by"
)
SELECT 
    p.id as pool_id,
    p.percent_feeding,
    '2025-03-01 00:00:00'::timestamp,
    3  -- Default employee_id as integer
FROM pools p
WHERE p.percent_feeding IS NOT NULL; 