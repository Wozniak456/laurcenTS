/*
  Warnings:

  - Made the column `created_by` on table `itembatches` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "itembatches" ALTER COLUMN "created" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "created_by" SET NOT NULL;
