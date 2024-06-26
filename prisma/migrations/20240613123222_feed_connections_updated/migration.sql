/*
  Warnings:

  - You are about to drop the column `feed_connection_id` on the `items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_feed_connection_id_fkey";

-- AlterTable
ALTER TABLE "items" DROP COLUMN "feed_connection_id";
