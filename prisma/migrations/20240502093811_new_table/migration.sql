-- CreateTable
CREATE TABLE "feedtypes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "feedtypes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feedtypes_name_key" ON "feedtypes"("name");
