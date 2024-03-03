-- AlterTable
ALTER TABLE "pools" ALTER COLUMN "cleaning_frequency" DROP NOT NULL,
ALTER COLUMN "water_temperature" DROP NOT NULL;
