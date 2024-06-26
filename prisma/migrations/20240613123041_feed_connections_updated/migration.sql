-- DropForeignKey
ALTER TABLE "feedconnections" DROP CONSTRAINT "feedconnections_fish_id_fkey";

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "feed_connection_id" INTEGER;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_feed_connection_id_fkey" FOREIGN KEY ("feed_connection_id") REFERENCES "feedconnections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
