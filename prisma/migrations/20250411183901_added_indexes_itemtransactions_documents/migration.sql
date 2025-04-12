-- CreateIndex
CREATE INDEX "idx_documents_date_doc_type" ON "documents"("date_time", "doc_type_id");

-- CreateIndex
CREATE INDEX "idx_documents_doc_type_date" ON "documents"("doc_type_id", "date_time");

-- CreateIndex
CREATE INDEX "idx_itemtransactions_location" ON "itemtransactions"("location_id");
