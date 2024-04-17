/*
  Warnings:

  - Added the required column `voederconversie` to the `datatable_over25` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "datatable_over25" ADD COLUMN     "voederconversie" DOUBLE PRECISION NOT NULL;
