/*
  Warnings:

  - Made the column `doc_id` on table `calculation_table` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "calculation_table" ALTER COLUMN "doc_id" SET NOT NULL;
