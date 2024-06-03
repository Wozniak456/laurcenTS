/*
  Warnings:

  - Made the column `purch_type_id` on table `purchtable` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "purchtable" ALTER COLUMN "purch_type_id" SET NOT NULL;
