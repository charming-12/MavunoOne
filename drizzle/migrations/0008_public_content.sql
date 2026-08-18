CREATE TABLE IF NOT EXISTS "public_content" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" varchar(160) NOT NULL UNIQUE,
  "contentType" varchar(32) DEFAULT 'announcement' NOT NULL,
  "title" varchar(256) NOT NULL,
  "subtitle" varchar(512),
  "body" text,
  "imageUrl" text,
  "ctaLabel" varchar(128),
  "ctaHref" varchar(512),
  "status" varchar(32) DEFAULT 'draft' NOT NULL,
  "isPublic" boolean DEFAULT false NOT NULL,
  "sortOrder" integer DEFAULT 0 NOT NULL,
  "createdBy" integer,
  "reviewedBy" integer,
  "publishedBy" integer,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  "reviewedAt" timestamp,
  "publishedAt" timestamp
);

CREATE INDEX IF NOT EXISTS "public_content_public_idx"
  ON "public_content" ("isPublic", "status", "sortOrder");

CREATE INDEX IF NOT EXISTS "public_content_type_idx"
  ON "public_content" ("contentType", "status");
