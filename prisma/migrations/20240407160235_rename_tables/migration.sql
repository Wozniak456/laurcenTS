/*
  Warnings:

  - You are about to drop the `datatableBelow25` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `datatableOver25` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "datatableBelow25";

-- DropTable
DROP TABLE "datatableOver25";

-- CreateTable
CREATE TABLE "datatable_below25" (
    "id" SERIAL NOT NULL,
    "day" INTEGER NOT NULL,
    "feedingLevel" DOUBLE PRECISION NOT NULL,
    "fc" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "voerhoeveelheid" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "datatable_below25_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "datatable_over25" (
    "id" SERIAL NOT NULL,
    "day" INTEGER NOT NULL,
    "av_weight" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "uitval" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "datatable_over25_pkey" PRIMARY KEY ("id")
);
