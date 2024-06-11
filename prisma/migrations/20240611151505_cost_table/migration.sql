-- CreateTable
CREATE TABLE "cost_table" (
    "id" SERIAL NOT NULL,
    "date_time" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "batch_id" BIGINT NOT NULL,
    "location_id" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "cost_table_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cost_table" ADD CONSTRAINT "cost_table_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "itembatches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cost_table" ADD CONSTRAINT "cost_table_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
