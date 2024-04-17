/*
  Warnings:

  - You are about to drop the `datatable` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "datatable";

-- CreateTable
CREATE TABLE "datatableBelow25" (
    "id" SERIAL NOT NULL,
    "day" INTEGER NOT NULL,
    "feedingLevel" DOUBLE PRECISION NOT NULL,
    "fc" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "voerhoeveelheid" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "datatableBelow25_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "datatableOver25" (
    "id" SERIAL NOT NULL,
    "day" INTEGER NOT NULL,
    "av_weight" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "uitval" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "datatableOver25_pkey" PRIMARY KEY ("id")
);
