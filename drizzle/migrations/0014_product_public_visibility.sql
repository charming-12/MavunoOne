ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "isPublic" boolean NOT NULL DEFAULT true;
