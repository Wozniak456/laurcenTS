/*
  Warnings:

  - You are about to drop the column `transaction_id` on the `generation_feed_amount` table. All the data in the column will be lost.
  - Added the required column `amount` to the `generation_feed_amount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "generation_feed_amount" DROP CONSTRAINT "generation_feed_amount_transaction_id_fkey";

-- AlterTable
ALTER TABLE "generation_feed_amount" DROP COLUMN "transaction_id",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL;
