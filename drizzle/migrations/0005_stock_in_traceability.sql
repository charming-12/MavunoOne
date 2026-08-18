ALTER TABLE "stock_in" ADD COLUMN IF NOT EXISTS "sourceType" varchar(32) DEFAULT 'supplier';
ALTER TABLE "stock_in" ADD COLUMN IF NOT EXISTS "purchaseReference" varchar(128);
ALTER TABLE "stock_in" ADD COLUMN IF NOT EXISTS "batchNumber" varchar(128);
ALTER TABLE "stock_in" ADD COLUMN IF NOT EXISTS "vehicleReference" varchar(128);
ALTER TABLE "stock_in" ADD COLUMN IF NOT EXISTS "warehouseLocation" varchar(128);
ALTER TABLE "stock_in" ADD COLUMN IF NOT EXISTS "receivedBy" varchar(256);
ALTER TABLE "stock_in" ADD COLUMN IF NOT EXISTS "qualityStatus" varchar(32) DEFAULT 'accepted';

UPDATE "stock_in" SET "sourceType" = 'supplier' WHERE "sourceType" IS NULL;
UPDATE "stock_in" SET "qualityStatus" = 'accepted' WHERE "qualityStatus" IS NULL;
