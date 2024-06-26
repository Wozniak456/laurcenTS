/*
  Warnings:

  - You are about to drop the column `location_id` on the `cost_table` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "cost_table" DROP CONSTRAINT "cost_table_location_id_fkey";

-- AlterTable
ALTER TABLE "cost_table" DROP COLUMN "location_id";
