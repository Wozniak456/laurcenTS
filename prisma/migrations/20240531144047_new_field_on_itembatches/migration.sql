/*
  Warnings:

  - A unique constraint covering the columns `[generation]` on the table `itembatches` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `generation` to the `itembatches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "itembatches" ADD COLUMN     "generation" VARCHAR NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "itembatches_generation_key" ON "itembatches"("generation");
