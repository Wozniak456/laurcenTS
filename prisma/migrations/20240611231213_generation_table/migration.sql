/*
  Warnings:

  - You are about to drop the column `generation` on the `itembatches` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "itembatches_generation_key";

-- AlterTable
ALTER TABLE "itembatches" DROP COLUMN "generation";

-- CreateTable
CREATE TABLE "batch_generation" (
    "id" BIGSERIAL NOT NULL,
    "location_id" INTEGER NOT NULL,
    "batch_id" BIGINT,

    CONSTRAINT "batch_generation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "batch_generation" ADD CONSTRAINT "batch_generation_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch_generation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "batch_generation" ADD CONSTRAINT "batch_generation_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
