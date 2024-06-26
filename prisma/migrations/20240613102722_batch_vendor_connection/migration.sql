-- AlterTable
ALTER TABLE "itembatches" ADD COLUMN     "vendor_id" INTEGER;

-- AddForeignKey
ALTER TABLE "itembatches" ADD CONSTRAINT "itembatches_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
