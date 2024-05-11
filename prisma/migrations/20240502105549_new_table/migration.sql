/*
  Warnings:

  - A unique constraint covering the columns `[feed_type_id]` on the table `feedconnections` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `feed_type_id` to the `feedconnections` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "feedconnections" ADD COLUMN     "feed_type_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "feedconnections_feed_type_id_key" ON "feedconnections"("feed_type_id");

-- AddForeignKey
ALTER TABLE "feedconnections" ADD CONSTRAINT "feedconnections_feed_type_id_fkey" FOREIGN KEY ("feed_type_id") REFERENCES "feedtypes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
