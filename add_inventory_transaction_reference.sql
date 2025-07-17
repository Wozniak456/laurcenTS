-- Add reference connection between inventory_counting_lines and itemtransactions
-- This allows tracking which transaction was created when inventory difference was posted

-- Step 1: Add the foreign key column to inventory_counting_lines table
ALTER TABLE inventory_counting_lines 
ADD COLUMN itemtransaction_id BIGINT;

-- Step 2: Add the foreign key constraint
ALTER TABLE inventory_counting_lines 
ADD CONSTRAINT fk_inventory_counting_lines_itemtransaction 
FOREIGN KEY (itemtransaction_id) 
REFERENCES itemtransactions(id) 
ON DELETE SET NULL; -- Set to NULL if transaction is deleted

-- Step 3: Add an index for better query performance
CREATE INDEX idx_inventory_counting_lines_itemtransaction 
ON inventory_counting_lines(itemtransaction_id);

-- Step 4: Add a comment to document the purpose
COMMENT ON COLUMN inventory_counting_lines.itemtransaction_id IS 
'Reference to itemtransactions table. NULL when inventory line has not been posted yet.'; 