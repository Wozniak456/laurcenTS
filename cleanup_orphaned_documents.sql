-- Clean up orphaned documents with doctype 15
-- These are documents that exist but don't have corresponding inventory_counting records

-- First, let's see what we're about to delete (SAFETY CHECK)
SELECT 
    'ABOUT TO DELETE:' as action,
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

-- If the above looks correct, uncomment the DELETE statement below:

/*
-- DELETE orphaned documents with doctype 15
DELETE FROM documents 
WHERE id IN (
    SELECT d.id
    FROM documents d
    LEFT JOIN inventory_counting ic ON d.id = ic.doc_id
    WHERE d.doc_type_id = 15 
    AND ic.id IS NULL
);

-- Verify cleanup
SELECT 
    'AFTER CLEANUP:' as status,
    COUNT(*) as total_documents_type_15,
    COUNT(ic.id) as linked_to_inventory_counting,
    COUNT(*) - COUNT(ic.id) as orphaned_documents
FROM documents d
LEFT JOIN inventory_counting ic ON d.id = ic.doc_id
WHERE d.doc_type_id = 15;
*/ 