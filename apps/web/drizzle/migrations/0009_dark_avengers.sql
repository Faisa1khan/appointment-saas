ALTER TABLE "service_categories" ADD COLUMN "slug" text;
UPDATE "service_categories" SET "slug" = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));
ALTER TABLE "service_categories" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "service_categories_org_name_idx" ON "service_categories" USING btree ("organization_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "service_categories_org_slug_idx" ON "service_categories" USING btree ("organization_id","slug");