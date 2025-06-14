-- CreateTable
CREATE TABLE "priority_history" (
    "id" SERIAL NOT NULL,
    "location_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3),
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "priority_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "percent_feeding_history" (
    "id" SERIAL NOT NULL,
    "pool_id" INTEGER NOT NULL,
    "percent_feeding" DECIMAL(65,30) NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3),
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "percent_feeding_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "priority_history" ADD CONSTRAINT "priority_history_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "priority_history" ADD CONSTRAINT "priority_history_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "priority_history" ADD CONSTRAINT "priority_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "priority_history" ADD CONSTRAINT "priority_history_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "percent_feeding_history" ADD CONSTRAINT "percent_feeding_history_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "pools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "percent_feeding_history" ADD CONSTRAINT "percent_feeding_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "percent_feeding_history" ADD CONSTRAINT "percent_feeding_history_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE; 