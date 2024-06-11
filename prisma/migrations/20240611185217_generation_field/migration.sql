/*
  Warnings:

  - A unique constraint covering the columns `[generation]` on the table `itembatches` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "itembatches" ADD COLUMN     "generation" VARCHAR;

-- CreateIndex
CREATE UNIQUE INDEX "itembatches_generation_key" ON "itembatches"("generation");
