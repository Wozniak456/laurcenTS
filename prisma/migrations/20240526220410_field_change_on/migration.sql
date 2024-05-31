/*
  Warnings:

  - You are about to drop the column `is_transition_start` on the `calculation_table` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "calculation_table" DROP COLUMN "is_transition_start",
ADD COLUMN     "transition_day" INTEGER;
