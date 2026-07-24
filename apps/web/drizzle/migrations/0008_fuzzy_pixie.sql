ALTER TABLE "services" ADD COLUMN "slug" text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "services_org_slug_idx" ON "services" USING btree ("organization_id","slug");