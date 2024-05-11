/*
  Warnings:

  - Added the required column `individual_id` to the `employees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "individual_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_individual_id_fkey" FOREIGN KEY ("individual_id") REFERENCES "individuals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
