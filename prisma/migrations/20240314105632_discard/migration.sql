-- AddForeignKey
ALTER TABLE "itembatches" ADD CONSTRAINT "itembatches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
