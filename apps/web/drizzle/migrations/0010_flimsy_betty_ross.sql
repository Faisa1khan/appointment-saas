-- 1. Add columns without NOT NULL constraint on slug
ALTER TABLE "resources" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint

-- 2. Backfill slugs for existing resources
UPDATE "resources" 
SET "slug" = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) 
WHERE "slug" IS NULL;--> statement-breakpoint

-- 3. In case any slug ended up empty or identical, append a portion of the UUID
UPDATE "resources" 
SET "slug" = "slug" || '-' || substr(id::text, 1, 8) 
WHERE "slug" = '' OR "slug" IS NULL;--> statement-breakpoint

-- 4. Apply NOT NULL constraint
ALTER TABLE "resources" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint

-- 5. Create index
CREATE UNIQUE INDEX "resources_org_slug_idx" ON "resources" USING btree ("organization_id","slug");