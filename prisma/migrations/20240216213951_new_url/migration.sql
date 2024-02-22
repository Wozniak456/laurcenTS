-- CreateTable
CREATE TABLE "calculation_table" (
    "id" SERIAL NOT NULL,
    "day" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "fish_amount_in_pool" INTEGER NOT NULL,
    "general_weight" DOUBLE PRECISION NOT NULL,
    "fish_weight" DOUBLE PRECISION NOT NULL,
    "feed_quantity" DOUBLE PRECISION NOT NULL,
    "v_c" DOUBLE PRECISION NOT NULL,
    "total_weight" DOUBLE PRECISION NOT NULL,
    "weight_per_fish" DOUBLE PRECISION NOT NULL,
    "feed_today" DOUBLE PRECISION NOT NULL,
    "feed_per_day" DOUBLE PRECISION NOT NULL,
    "feed_per_feeding" DOUBLE PRECISION NOT NULL,
    "doc_id" BIGINT NOT NULL,

    CONSTRAINT "calculation_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctype" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,

    CONSTRAINT "doctype_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" BIGSERIAL NOT NULL,
    "location_id" INTEGER,
    "doc_type_id" INTEGER,
    "date_time" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executed_by" INTEGER NOT NULL,
    "comments" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employeepositions" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,

    CONSTRAINT "employeepositions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "empl_position_id" INTEGER,
    "date_from" TIMESTAMP(6),
    "date_to" TIMESTAMP(6),

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedconnections" (
    "id" SERIAL NOT NULL,
    "fish_id" INTEGER NOT NULL,
    "feed_id" INTEGER NOT NULL,
    "from_fish_weight" DOUBLE PRECISION NOT NULL,
    "to_fish_weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "feedconnections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "individuals" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "surname" VARCHAR NOT NULL,
    "itn" VARCHAR(10),
    "description" TEXT,

    CONSTRAINT "individuals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itembatches" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "item_id" INTEGER NOT NULL,
    "created" TIMESTAMP(6) NOT NULL,
    "created_by" INTEGER,

    CONSTRAINT "itembatches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "item_type_id" INTEGER,
    "default_unit_id" INTEGER,
    "parent_item" INTEGER,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itemtransactions" (
    "id" BIGSERIAL NOT NULL,
    "doc_id" BIGINT NOT NULL,
    "location_id" INTEGER NOT NULL,
    "batch_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "parent_transaction" BIGINT,

    CONSTRAINT "itemtransactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itemtypes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "itemtypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" SERIAL NOT NULL,
    "location_type_id" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "pool_id" INTEGER,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locationtypes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,

    CONSTRAINT "locationtypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parameters" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "data_type" INTEGER NOT NULL,

    CONSTRAINT "parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametersvalues" (
    "id" BIGSERIAL NOT NULL,
    "parameter_id" INTEGER NOT NULL,
    "batch_id" BIGINT NOT NULL,
    "value" TEXT NOT NULL,
    "date" TIMESTAMP(6) NOT NULL,
    "comments" TEXT,

    CONSTRAINT "parametersvalues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pools" (
    "id" SERIAL NOT NULL,
    "prod_line_id" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "cleaning_frequency" INTEGER NOT NULL,
    "water_temperature" DOUBLE PRECISION NOT NULL,
    "x_location" DOUBLE PRECISION,
    "y_location" DOUBLE PRECISION,
    "pool_height" DOUBLE PRECISION,
    "pool_width" DOUBLE PRECISION,
    "pool_length" DOUBLE PRECISION,

    CONSTRAINT "pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productionareas" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,

    CONSTRAINT "productionareas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productionlines" (
    "id" SERIAL NOT NULL,
    "prod_area_id" INTEGER,
    "name" VARCHAR NOT NULL,
    "description" TEXT,

    CONSTRAINT "productionlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchaselines" (
    "id" SERIAL NOT NULL,
    "purchase_id" BIGINT NOT NULL,
    "item_transaction_id" BIGINT,
    "item_id" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit_id" INTEGER NOT NULL,

    CONSTRAINT "purchaselines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchtable" (
    "id" BIGSERIAL NOT NULL,
    "doc_id" BIGINT,
    "date_time" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vendor_id" INTEGER NOT NULL,
    "vendor_doc_number" VARCHAR NOT NULL,

    CONSTRAINT "purchtable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocking" (
    "id" SERIAL NOT NULL,
    "doc_id" BIGINT NOT NULL,
    "average_weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "stocking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "doctype_name_key" ON "doctype"("name");

-- CreateIndex
CREATE UNIQUE INDEX "employeepositions_name_key" ON "employeepositions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "uq_name_surname" ON "individuals"("name", "surname");

-- CreateIndex
CREATE UNIQUE INDEX "itembatches_name_key" ON "itembatches"("name");

-- CreateIndex
CREATE UNIQUE INDEX "items_name_key" ON "items"("name");

-- CreateIndex
CREATE UNIQUE INDEX "itemtypes_name_key" ON "itemtypes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "locations_name_key" ON "locations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "locationtypes_name_key" ON "locationtypes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "parameters_name_key" ON "parameters"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pools_name_key" ON "pools"("name");

-- CreateIndex
CREATE UNIQUE INDEX "productionareas_name_key" ON "productionareas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "productionlines_name_key" ON "productionlines"("name");

-- CreateIndex
CREATE UNIQUE INDEX "units_name_key" ON "units"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_name_key" ON "vendors"("name");

-- AddForeignKey
ALTER TABLE "calculation_table" ADD CONSTRAINT "calculation_table_doc_id_fkey" FOREIGN KEY ("doc_id") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_doc_type_id_fkey" FOREIGN KEY ("doc_type_id") REFERENCES "doctype"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_executed_by_fkey" FOREIGN KEY ("executed_by") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_empl_position_id_fkey" FOREIGN KEY ("empl_position_id") REFERENCES "employeepositions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedconnections" ADD CONSTRAINT "feedconnections_feed_id_fkey" FOREIGN KEY ("feed_id") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedconnections" ADD CONSTRAINT "feedconnections_fish_id_fkey" FOREIGN KEY ("fish_id") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "itembatches" ADD CONSTRAINT "itembatches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "itembatches" ADD CONSTRAINT "itembatches_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_default_unit_id_fkey" FOREIGN KEY ("default_unit_id") REFERENCES "units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_item_type_id_fkey" FOREIGN KEY ("item_type_id") REFERENCES "itemtypes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "itemtransactions" ADD CONSTRAINT "itemtransactions_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "itembatches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "itemtransactions" ADD CONSTRAINT "itemtransactions_doc_id_fkey" FOREIGN KEY ("doc_id") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "itemtransactions" ADD CONSTRAINT "itemtransactions_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "itemtransactions" ADD CONSTRAINT "itemtransactions_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_location_type_id_fkey" FOREIGN KEY ("location_type_id") REFERENCES "locationtypes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "pools"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parametersvalues" ADD CONSTRAINT "parametersvalues_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "itembatches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parametersvalues" ADD CONSTRAINT "parametersvalues_parameter_id_fkey" FOREIGN KEY ("parameter_id") REFERENCES "parameters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pools" ADD CONSTRAINT "pools_prod_line_id_fkey" FOREIGN KEY ("prod_line_id") REFERENCES "productionlines"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "productionlines" ADD CONSTRAINT "productionlines_prod_area_id_fkey" FOREIGN KEY ("prod_area_id") REFERENCES "productionareas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchaselines" ADD CONSTRAINT "purchaselines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchaselines" ADD CONSTRAINT "purchaselines_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchtable"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchaselines" ADD CONSTRAINT "purchaselines_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchtable" ADD CONSTRAINT "purchtable_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stocking" ADD CONSTRAINT "stocking_doc_id_fkey" FOREIGN KEY ("doc_id") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
