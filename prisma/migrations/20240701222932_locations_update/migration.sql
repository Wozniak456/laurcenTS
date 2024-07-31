-- AlterTable
CREATE SEQUENCE locations_id_seq;
ALTER TABLE "locations" ALTER COLUMN "id" SET DEFAULT nextval('locations_id_seq');
ALTER SEQUENCE locations_id_seq OWNED BY "locations"."id";
