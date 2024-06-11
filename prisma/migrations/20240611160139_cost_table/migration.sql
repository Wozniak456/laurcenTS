/*
  Warnings:

  - Added the required column `item_transaction_id` to the `cost_table` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cost_table" ADD COLUMN     "item_transaction_id" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "cost_table" ADD CONSTRAINT "cost_table_item_transaction_id_fkey" FOREIGN KEY ("item_transaction_id") REFERENCES "itemtransactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
