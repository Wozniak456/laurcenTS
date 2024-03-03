-- DropIndex
DROP INDEX "productionlines_name_key";

-- AlterTable
ALTER TABLE "productionlines" ALTER COLUMN "name" SET DATA TYPE TEXT;
