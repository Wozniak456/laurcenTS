-- CreateTable
CREATE TABLE "priorities" (
    "id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "batch_id" BIGINT NOT NULL,
    "location_id" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL,

    CONSTRAINT "priorities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "priorities" ADD CONSTRAINT "priorities_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "priorities" ADD CONSTRAINT "priorities_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "itembatches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "priorities" ADD CONSTRAINT "priorities_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
