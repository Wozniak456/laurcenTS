-- Add check constraint to prevent negative or zero quantities
ALTER TABLE itemtransactions ADD CONSTRAINT chk_quantity_positive CHECK (quantity > 0);

-- Add check constraint to prevent negative or zero quantities in itembatches (if there's a quantity field)
-- Note: This is a precautionary measure in case itembatches gets a quantity field in the future
