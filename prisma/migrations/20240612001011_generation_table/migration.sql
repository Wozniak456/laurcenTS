/*
  Warnings:

  - You are about to drop the column `batch_id` on the `batch_generation` table. All the data in the column will be lost.
  - You are about to drop the column `batch_id` on the `cost_table` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "batch_generation" DROP CONSTRAINT "batch_generation_batch_id_fkey";

-- DropForeignKey
ALTER TABLE "cost_table" DROP CONSTRAINT "cost_table_batch_id_fkey";

-- AlterTable
ALTER TABLE "batch_generation" DROP COLUMN "batch_id",
ADD COLUMN     "batch_generation_id" BIGINT;

-- AlterTable
ALTER TABLE "cost_table" DROP COLUMN "batch_id",
ADD COLUMN     "batch_generation_id" BIGINT;

-- AddForeignKey
ALTER TABLE "cost_table" ADD CONSTRAINT "cost_table_batch_generation_id_fkey" FOREIGN KEY ("batch_generation_id") REFERENCES "batch_generation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "batch_generation" ADD CONSTRAINT "batch_generation_batch_generation_id_fkey" FOREIGN KEY ("batch_generation_id") REFERENCES "batch_generation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
