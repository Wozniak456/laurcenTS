/*
  Warnings:

  - You are about to drop the column `feed_type_id` on the `generation_feed_amount` table. All the data in the column will be lost.
  - Added the required column `feed_batch_id` to the `generation_feed_amount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "generation_feed_amount" DROP CONSTRAINT "generation_feed_amount_feed_type_id_fkey";

-- AlterTable
ALTER TABLE "generation_feed_amount" DROP COLUMN "feed_type_id",
ADD COLUMN     "feed_batch_id" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "generation_feed_amount" ADD CONSTRAINT "generation_feed_amount_feed_batch_id_fkey" FOREIGN KEY ("feed_batch_id") REFERENCES "itembatches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
