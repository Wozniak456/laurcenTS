/*
  Warnings:

  - Made the column `location_id` on table `documents` required. This step will fail if there are existing NULL values in that column.
  - Made the column `doc_type_id` on table `documents` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_location_id_fkey";

-- AlterTable
ALTER TABLE "documents" ALTER COLUMN "location_id" SET NOT NULL,
ALTER COLUMN "doc_type_id" SET NOT NULL;

-- First add doc_id as nullable
ALTER TABLE "generation_feed_amount" ADD COLUMN "doc_id" BIGINT;

-- Update existing records with document IDs from itemtransactions
UPDATE "generation_feed_amount" gfa
SET doc_id = it.doc_id
FROM "itemtransactions" it
WHERE it.batch_id = gfa.feed_batch_id;

-- Now make the column required
ALTER TABLE "generation_feed_amount" ALTER COLUMN "doc_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "_documentsTolocations" (
    "A" BIGINT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_documentsTolocations_AB_unique" ON "_documentsTolocations"("A", "B");

-- CreateIndex
CREATE INDEX "_documentsTolocations_B_index" ON "_documentsTolocations"("B");

-- AddForeignKey
ALTER TABLE "generation_feed_amount" ADD CONSTRAINT "generation_feed_amount_doc_id_fkey" FOREIGN KEY ("doc_id") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_documentsTolocations" ADD CONSTRAINT "_documentsTolocations_A_fkey" FOREIGN KEY ("A") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_documentsTolocations" ADD CONSTRAINT "_documentsTolocations_B_fkey" FOREIGN KEY ("B") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
