ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "packageSizeKg" numeric(12, 3) DEFAULT '1' NOT NULL;
ALTER TABLE "sale_items" ADD COLUMN IF NOT EXISTS "baseQuantity" numeric(12, 3) DEFAULT '0' NOT NULL;
ALTER TABLE "stock_in" ADD COLUMN IF NOT EXISTS "entryUnit" varchar(32) DEFAULT 'kg' NOT NULL;
ALTER TABLE "stock_in" ADD COLUMN IF NOT EXISTS "baseQuantity" numeric(12, 3) DEFAULT '0' NOT NULL;
ALTER TABLE "stock_out" ADD COLUMN IF NOT EXISTS "baseQuantity" numeric(12, 3) DEFAULT '0' NOT NULL;

UPDATE "products" SET "packageSizeKg" = '1' WHERE "packageSizeKg" IS NULL;
UPDATE "sale_items" SET "baseQuantity" = "quantity" WHERE "baseQuantity" IS NULL OR "baseQuantity" = 0;
UPDATE "stock_in" SET "baseQuantity" = "quantity" WHERE "baseQuantity" IS NULL OR "baseQuantity" = 0;
UPDATE "stock_out" SET "baseQuantity" = "quantity" WHERE "baseQuantity" IS NULL OR "baseQuantity" = 0;
