-- CreateTable
CREATE TABLE "datatable" (
    "id" SERIAL NOT NULL,
    "day" INTEGER NOT NULL,
    "feedingLevel" DOUBLE PRECISION NOT NULL,
    "fc" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "voerhoeveelheid" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "datatable_pkey" PRIMARY KEY ("id")
);
