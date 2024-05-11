-- AlterTable
ALTER TABLE "itemtransactions" ADD COLUMN     "status_id" INTEGER NOT NULL DEFAULT 3;

-- AddForeignKey
ALTER TABLE "itemtransactions" ADD CONSTRAINT "itemtransactions_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "transactionsstate"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
