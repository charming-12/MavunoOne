ALTER TABLE "password_reset_tokens"
  ADD COLUMN IF NOT EXISTS "otpCodeHash" varchar(128);
