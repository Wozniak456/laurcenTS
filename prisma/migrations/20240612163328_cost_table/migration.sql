-- AlterTable
ALTER TABLE "cost_table" ADD COLUMN     "feed_type_id" INTEGER;

-- AddForeignKey
ALTER TABLE "cost_table" ADD CONSTRAINT "cost_table_feed_type_id_fkey" FOREIGN KEY ("feed_type_id") REFERENCES "feedtypes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
