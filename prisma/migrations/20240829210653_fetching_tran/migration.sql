/*
  Warnings:

  - You are about to drop the column `doc_id` on the `fetching` table. All the data in the column will be lost.
  - Added the required column `tran_id` to the `fetching` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "fetching" DROP CONSTRAINT "fetching_doc_id_fkey";

-- AlterTable
ALTER TABLE "fetching" DROP COLUMN "doc_id",
ADD COLUMN     "tran_id" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "fetching" ADD CONSTRAINT "fetching_tran_id_fkey" FOREIGN KEY ("tran_id") REFERENCES "itemtransactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
