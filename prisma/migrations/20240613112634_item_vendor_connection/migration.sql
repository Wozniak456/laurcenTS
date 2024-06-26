/*
  Warnings:

  - You are about to drop the column `vendor_id` on the `itembatches` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "itembatches" DROP CONSTRAINT "itembatches_vendor_id_fkey";

-- AlterTable
ALTER TABLE "itembatches" DROP COLUMN "vendor_id";

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "vendor_id" INTEGER;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
