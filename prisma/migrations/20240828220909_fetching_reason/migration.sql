/*
  Warnings:

  - You are about to drop the column `av_weight` on the `fetching` table. All the data in the column will be lost.
  - Added the required column `fetching_reason` to the `fetching` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_weight` to the `fetching` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fetching" DROP COLUMN "av_weight",
ADD COLUMN     "fetching_reason" TEXT NOT NULL,
ADD COLUMN     "total_weight" DOUBLE PRECISION NOT NULL;
