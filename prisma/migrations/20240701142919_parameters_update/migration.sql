/*
  Warnings:

  - You are about to drop the column `batch_id` on the `parametersvalues` table. All the data in the column will be lost.
  - You are about to drop the column `comments` on the `parametersvalues` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "parametersvalues" DROP CONSTRAINT "parametersvalues_batch_id_fkey";

-- AlterTable
ALTER TABLE "parametersvalues" DROP COLUMN "batch_id",
DROP COLUMN "comments",
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;
