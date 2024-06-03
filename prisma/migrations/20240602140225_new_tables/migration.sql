/*
  Warnings:

  - You are about to drop the column `purch_type_id` on the `purchtable` table. All the data in the column will be lost.
  - You are about to drop the `purchtype` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "purchtable" DROP CONSTRAINT "purchtable_purch_type_id_fkey";

-- AlterTable
ALTER TABLE "purchtable" DROP COLUMN "purch_type_id";

-- DropTable
DROP TABLE "purchtype";

-- CreateTable
CREATE TABLE "salestable" (
    "id" BIGSERIAL NOT NULL,
    "doc_id" BIGINT,
    "date_time" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" INTEGER NOT NULL,

    CONSTRAINT "salestable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saleslines" (
    "id" SERIAL NOT NULL,
    "salestable_id" BIGINT NOT NULL,
    "item_transaction_id" BIGINT,
    "item_id" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit_id" INTEGER NOT NULL,

    CONSTRAINT "saleslines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_name_key" ON "customers"("name");

-- AddForeignKey
ALTER TABLE "purchaselines" ADD CONSTRAINT "purchaselines_item_transaction_id_fkey" FOREIGN KEY ("item_transaction_id") REFERENCES "itemtransactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "salestable" ADD CONSTRAINT "salestable_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "saleslines" ADD CONSTRAINT "saleslines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "saleslines" ADD CONSTRAINT "saleslines_salestable_id_fkey" FOREIGN KEY ("salestable_id") REFERENCES "salestable"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "saleslines" ADD CONSTRAINT "saleslines_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "saleslines" ADD CONSTRAINT "saleslines_item_transaction_id_fkey" FOREIGN KEY ("item_transaction_id") REFERENCES "itemtransactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
