CREATE TABLE IF NOT EXISTS "farmers" (
  "id" serial PRIMARY KEY NOT NULL,
  "farmerNumber" varchar(32) NOT NULL,
  "name" varchar(256) NOT NULL,
  "phone" varchar(32),
  "location" varchar(128),
  "farmSize" numeric(10, 2),
  "farmSizeUnit" varchar(16) DEFAULT 'acres' NOT NULL,
  "isActive" boolean DEFAULT true NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "farmers_farmerNumber_unique" UNIQUE("farmerNumber")
);

CREATE TABLE IF NOT EXISTS "farmer_payments" (
  "id" serial PRIMARY KEY NOT NULL,
  "farmerId" integer NOT NULL,
  "productName" varchar(256) NOT NULL,
  "quantityKg" numeric(12, 2) NOT NULL,
  "pricePerKg" numeric(12, 2) NOT NULL,
  "totalAmount" numeric(12, 2) NOT NULL,
  "paidAmount" numeric(12, 2) DEFAULT '0' NOT NULL,
  "balance" numeric(12, 2) DEFAULT '0' NOT NULL,
  "paymentMethod" varchar(32) DEFAULT 'cash' NOT NULL,
  "paymentStatus" varchar(32) DEFAULT 'unpaid' NOT NULL,
  "paymentReference" varchar(128),
  "createdBy" integer,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "farmer_payments_farmer_id_idx" ON "farmer_payments" ("farmerId");
CREATE INDEX IF NOT EXISTS "farmer_payments_created_at_idx" ON "farmer_payments" ("createdAt");
