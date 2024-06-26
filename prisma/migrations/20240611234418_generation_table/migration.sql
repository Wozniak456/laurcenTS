-- AlterTable
ALTER TABLE "batch_generation" ADD COLUMN     "initial_batch_id" BIGINT;

-- AddForeignKey
ALTER TABLE "batch_generation" ADD CONSTRAINT "batch_generation_initial_batch_id_fkey" FOREIGN KEY ("initial_batch_id") REFERENCES "itembatches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
