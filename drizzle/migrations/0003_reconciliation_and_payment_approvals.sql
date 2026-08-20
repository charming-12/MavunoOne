CREATE TABLE IF NOT EXISTS "stock_reconciliations" (
  "id" serial PRIMARY KEY NOT NULL,
  "productId" integer NOT NULL,
  "systemQuantity" numeric(12, 2) NOT NULL,
  "countedQuantity" numeric(12, 2) NOT NULL,
  "variance" numeric(12, 2) NOT NULL,
  "adjustmentReason" varchar(64) NOT NULL,
  "notes" text,
  "status" varchar(32) DEFAULT 'approved' NOT NULL,
  "countedBy" integer,
  "approvedBy" integer,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "stock_reconciliations_product_idx" ON "stock_reconciliations" ("productId");
CREATE INDEX IF NOT EXISTS "stock_reconciliations_created_idx" ON "stock_reconciliations" ("createdAt");

CREATE TABLE IF NOT EXISTS "farmer_payment_approvals" (
  "id" serial PRIMARY KEY NOT NULL,
  "farmerPaymentId" integer NOT NULL,
  "requestedAmount" numeric(12, 2) NOT NULL,
  "status" varchar(32) DEFAULT 'pending' NOT NULL,
  "requestedBy" integer NOT NULL,
  "approvedBy" integer,
  "paidBy" integer,
  "paymentReference" varchar(128),
  "rejectionReason" text,
  "requestedAt" timestamp DEFAULT now() NOT NULL,
  "approvedAt" timestamp,
  "paidAt" timestamp
);
CREATE INDEX IF NOT EXISTS "farmer_payment_approvals_status_idx" ON "farmer_payment_approvals" ("status");
CREATE INDEX IF NOT EXISTS "farmer_payment_approvals_requested_idx" ON "farmer_payment_approvals" ("requestedAt");
