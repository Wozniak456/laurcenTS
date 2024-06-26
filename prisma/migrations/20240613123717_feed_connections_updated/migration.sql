/*
  Warnings:

  - You are about to drop the column `feed_type_id` on the `feedconnections` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "feedconnections" DROP CONSTRAINT "feedconnections_feed_type_id_fkey";

-- DropIndex
DROP INDEX "feedconnections_feed_type_id_key";

-- AlterTable
ALTER TABLE "feedconnections" DROP COLUMN "feed_type_id";

-- AlterTable
ALTER TABLE "feedtypes" ADD COLUMN     "feedconnection_id" INTEGER;

-- AddForeignKey
ALTER TABLE "feedtypes" ADD CONSTRAINT "feedtypes_feedconnection_id_fkey" FOREIGN KEY ("feedconnection_id") REFERENCES "feedconnections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
