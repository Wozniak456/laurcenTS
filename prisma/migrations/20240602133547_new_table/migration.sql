-- AlterTable
ALTER TABLE "purchtable" ADD COLUMN     "purch_type_id" INTEGER;

-- CreateTable
CREATE TABLE "purchtype" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "purchtype_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "purchtype_name_key" ON "purchtype"("name");

-- AddForeignKey
ALTER TABLE "purchtable" ADD CONSTRAINT "purchtable_purch_type_id_fkey" FOREIGN KEY ("purch_type_id") REFERENCES "purchtype"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
