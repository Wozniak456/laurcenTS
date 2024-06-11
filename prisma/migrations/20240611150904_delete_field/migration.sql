/*
  Warnings:

  - You are about to drop the column `generation` on the `itembatches` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "itembatches_generation_key";

-- AlterTable
ALTER TABLE "itembatches" DROP COLUMN "generation";
