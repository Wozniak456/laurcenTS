-- Make inventory_counting.doc_id nullable
-- This allows creating inventory counting records without documents initially
-- Documents will only be created when posting the inventory counting

ALTER TABLE inventory_counting ALTER COLUMN doc_id DROP NOT NULL;

-- Add a comment to explain the change
COMMENT ON COLUMN inventory_counting.doc_id IS 'Links to documents table. NULL when draft, populated when posted.';
