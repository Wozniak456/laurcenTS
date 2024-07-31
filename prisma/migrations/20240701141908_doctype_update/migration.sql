/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `doctype` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "doctype" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "doctype_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "doctype_id_key" ON "doctype"("id");
