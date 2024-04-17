/*
  Warnings:

  - Added the required column `voederniveau` to the `datatable_over25` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "datatable_over25" ADD COLUMN     "voederniveau" DOUBLE PRECISION NOT NULL;
