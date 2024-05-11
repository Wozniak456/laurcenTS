-- AlterTable
ALTER TABLE "items" ADD COLUMN     "feed_type_id" INTEGER;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_feed_type_id_fkey" FOREIGN KEY ("feed_type_id") REFERENCES "feedtypes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
