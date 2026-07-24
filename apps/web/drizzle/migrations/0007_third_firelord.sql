CREATE UNIQUE INDEX "services_org_name_idx" ON "services" USING btree ("organization_id","name");--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "currency";