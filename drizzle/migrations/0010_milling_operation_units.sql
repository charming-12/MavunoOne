ALTER TABLE "machine_jobs" ADD COLUMN IF NOT EXISTS "operationType" varchar(32) DEFAULT 'internal_production' NOT NULL;
ALTER TABLE "machine_jobs" ADD COLUMN IF NOT EXISTS "inputUnit" varchar(32) DEFAULT 'kg' NOT NULL;
ALTER TABLE "machine_jobs" ADD COLUMN IF NOT EXISTS "inputQuantity" numeric(12, 2) DEFAULT '0' NOT NULL;
ALTER TABLE "machine_jobs" ADD COLUMN IF NOT EXISTS "inputUnitSize" numeric(12, 3) DEFAULT '1' NOT NULL;
ALTER TABLE "machine_jobs" ADD COLUMN IF NOT EXISTS "serviceUnit" varchar(32) DEFAULT 'kg';
ALTER TABLE "machine_jobs" ADD COLUMN IF NOT EXISTS "serviceQuantity" numeric(12, 2) DEFAULT '0';
ALTER TABLE "machine_jobs" ADD COLUMN IF NOT EXISTS "serviceRate" numeric(12, 2) DEFAULT '0';
UPDATE "machine_jobs"
SET "inputQuantity" = "inputKg",
    "inputUnitSize" = '1',
    "serviceUnit" = 'kg',
    "serviceQuantity" = "inputKg",
    "serviceRate" = CASE WHEN "inputKg" > 0 THEN "serviceFee" / "inputKg" ELSE '0' END
WHERE "inputQuantity" = '0' OR "inputQuantity" IS NULL;
UPDATE "machine_jobs" SET "operationType" = 'internal_production' WHERE "operationType" IS NULL;
UPDATE "machine_jobs" SET "inputUnit" = 'kg' WHERE "inputUnit" IS NULL;
UPDATE "machine_jobs" SET "serviceUnit" = 'kg' WHERE "serviceUnit" IS NULL;
UPDATE "machine_jobs" SET "serviceQuantity" = "inputKg" WHERE "serviceQuantity" IS NULL OR "serviceQuantity" = '0';
UPDATE "machine_jobs" SET "serviceRate" = CASE WHEN "inputKg" > 0 THEN "serviceFee" / "inputKg" ELSE '0' END WHERE "serviceRate" IS NULL OR "serviceRate" = '0';
CREATE INDEX IF NOT EXISTS "machine_jobs_operation_type_idx" ON "machine_jobs" ("operationType");
CREATE INDEX IF NOT EXISTS "machine_jobs_customer_idx" ON "machine_jobs" ("customerId");
