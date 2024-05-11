ALTER TABLE "public"."items"
ADD CONSTRAINT "ckeck_for_feed_item" 
CHECK (
    (item_type_id = 3 AND feed_type_id IS NOT NULL) OR 
    (item_type_id <> 3 AND feed_type_id IS NULL)
);