-- CreateTable
CREATE TABLE "fetching" (
    "id" BIGSERIAL NOT NULL,
    "doc_id" BIGINT NOT NULL,
    "av_weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "fetching_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "fetching" ADD CONSTRAINT "fetching_doc_id_fkey" FOREIGN KEY ("doc_id") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
