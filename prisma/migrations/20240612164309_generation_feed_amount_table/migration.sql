/*
  Warnings:

  - You are about to drop the column `feed_type_id` on the `cost_table` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "cost_table" DROP CONSTRAINT "cost_table_feed_type_id_fkey";

-- AlterTable
ALTER TABLE "cost_table" DROP COLUMN "feed_type_id";

-- CreateTable
CREATE TABLE "generation_feed_amount" (
    "id" BIGSERIAL NOT NULL,
    "batch_generation_id" BIGINT NOT NULL,
    "feed_type_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "generation_feed_amount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "generation_feed_amount" ADD CONSTRAINT "generation_feed_amount_feed_type_id_fkey" FOREIGN KEY ("feed_type_id") REFERENCES "feedtypes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "generation_feed_amount" ADD CONSTRAINT "generation_feed_amount_batch_generation_id_fkey" FOREIGN KEY ("batch_generation_id") REFERENCES "batch_generation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
