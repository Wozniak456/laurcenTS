/*
  Warnings:

  - Added the required column `weekNumber` to the `fetching` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fetching" ADD COLUMN     "weekNumber" INTEGER NOT NULL;
