-- Check for orphaned documents with doctype 15 (inventory counting)
-- These are documents that exist but don't have corresponding inventory_counting records

-- Query 1: Find all documents with doctype 15
SELECT 
    d.id as document_id,
    d.date_time,
    d.executed_by,
    d.comments,
    d.date_time_posted,
    CASE 
        WHEN ic.id IS NULL THEN 'ORPHANED - No inventory_counting record'
        ELSE 'LINKED - Has inventory_counting record'
    END as status
FROM documents d
LEFT JOIN inventory_counting ic ON d.id = ic.doc_id
WHERE d.doc_type_id = 15
ORDER BY d.date_time DESC;

-- Query 2: Count orphaned vs linked documents
SELECT 
    COUNT(*) as total_documents_type_15,
    COUNT(ic.id) as linked_to_inventory_counting,
    COUNT(*) - COUNT(ic.id) as orphaned_documents
FROM documents d
LEFT JOIN inventory_counting ic ON d.id = ic.doc_id
WHERE d.doc_type_id = 15;

-- Query 3: Show only orphaned documents (the problematic ones)
SELECT 
    d.id as document_id,
    d.date_time,
    d.executed_by,
    d.comments,
    d.date_time_posted
FROM documents d
LEFT JOIN inventory_counting ic ON d.id = ic.doc_id
WHERE d.doc_type_id = 15 
AND ic.id IS NULL
ORDER BY d.date_time DESC; 