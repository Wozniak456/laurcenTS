/*
  Warnings:

  - You are about to drop the column `feed_id` on the `feedconnections` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "feedconnections" DROP CONSTRAINT "feedconnections_feed_id_fkey";

-- AlterTable
ALTER TABLE "feedconnections" DROP COLUMN "feed_id";
