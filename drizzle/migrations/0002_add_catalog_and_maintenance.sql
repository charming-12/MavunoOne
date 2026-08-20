ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "barcode" varchar(64);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "productType" varchar(32) DEFAULT 'finished_goods' NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "products_barcode_unique" ON "products" ("barcode") WHERE "barcode" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "maintenance_costs" (
  "id" serial PRIMARY KEY NOT NULL,
  "machineName" varchar(128) NOT NULL,
  "maintenanceType" varchar(64) NOT NULL,
  "amount" numeric(12, 2) NOT NULL,
  "serviceDate" timestamp DEFAULT now() NOT NULL,
  "nextDueDate" timestamp,
  "vendorName" varchar(256),
  "notes" text,
  "createdBy" integer,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "maintenance_costs_service_date_idx" ON "maintenance_costs" ("serviceDate");
