/*
  Warnings:

  - You are about to drop the column `amount` on the `generation_feed_amount` table. All the data in the column will be lost.
  - Added the required column `transaction_id` to the `generation_feed_amount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "generation_feed_amount" DROP COLUMN "amount",
ADD COLUMN     "transaction_id" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "generation_feed_amount" ADD CONSTRAINT "generation_feed_amount_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "itemtransactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
