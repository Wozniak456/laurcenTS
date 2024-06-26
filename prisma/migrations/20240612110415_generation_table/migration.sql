/*
  Warnings:

  - You are about to drop the column `batch_generation_id` on the `batch_generation` table. All the data in the column will be lost.
  - You are about to drop the column `item_transaction_id` on the `cost_table` table. All the data in the column will be lost.
  - Added the required column `transaction_id` to the `batch_generation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "batch_generation" DROP CONSTRAINT "batch_generation_batch_generation_id_fkey";

-- DropForeignKey
ALTER TABLE "cost_table" DROP CONSTRAINT "cost_table_item_transaction_id_fkey";

-- AlterTable
ALTER TABLE "batch_generation" DROP COLUMN "batch_generation_id",
ADD COLUMN     "first_parent_id" BIGINT,
ADD COLUMN     "second_parent_id" BIGINT,
ADD COLUMN     "transaction_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "cost_table" DROP COLUMN "item_transaction_id";

-- AddForeignKey
ALTER TABLE "batch_generation" ADD CONSTRAINT "batch_generation_first_parent_id_fkey" FOREIGN KEY ("first_parent_id") REFERENCES "batch_generation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "batch_generation" ADD CONSTRAINT "batch_generation_second_parent_id_fkey" FOREIGN KEY ("second_parent_id") REFERENCES "batch_generation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "batch_generation" ADD CONSTRAINT "batch_generation_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "itemtransactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
