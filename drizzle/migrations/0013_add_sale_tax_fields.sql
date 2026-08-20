ALTER TABLE "sales"
  ADD COLUMN IF NOT EXISTS "subtotal" numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "taxRate" numeric(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "taxAmount" numeric(12,2) NOT NULL DEFAULT 0;

UPDATE "sales"
SET "subtotal" = "totalAmount",
    "taxRate" = 0,
    "taxAmount" = 0
WHERE "subtotal" = 0 AND "totalAmount" > 0;
