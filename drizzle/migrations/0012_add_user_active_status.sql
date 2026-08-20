ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true;

UPDATE "users"
SET "isActive" = true
WHERE "isActive" IS NULL;

CREATE INDEX IF NOT EXISTS "users_is_active_idx" ON "users" ("isActive");

-- Existing business records remain linked to the user. Removal is implemented as
-- deactivation so sales, stock, milling and audit history are preserved.
