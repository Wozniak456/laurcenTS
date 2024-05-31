-- CreateTable
CREATE TABLE "disposal_table" (
    "id" SERIAL NOT NULL,
    "doc_id" BIGINT NOT NULL,
    "reason_id" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "batch_id" BIGINT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location_id" INTEGER NOT NULL,

    CONSTRAINT "disposal_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disposal_reasons" (
    "id" SERIAL NOT NULL,
    "reason" VARCHAR NOT NULL,

    CONSTRAINT "disposal_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "disposal_reasons_reason_key" ON "disposal_reasons"("reason");

-- AddForeignKey
ALTER TABLE "disposal_table" ADD CONSTRAINT "disposal_table_doc_id_fkey" FOREIGN KEY ("doc_id") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "disposal_table" ADD CONSTRAINT "disposal_table_reason_id_fkey" FOREIGN KEY ("reason_id") REFERENCES "disposal_reasons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "disposal_table" ADD CONSTRAINT "disposal_table_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "itembatches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "disposal_table" ADD CONSTRAINT "disposal_table_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
