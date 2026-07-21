CREATE SCHEMA IF NOT EXISTS "auth";
--> statement-breakpoint
CREATE TYPE "public"."booking_source" AS ENUM('ONLINE', 'WALK_IN', 'PHONE', 'STAFF');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('OWNER', 'STAFF');--> statement-breakpoint
CREATE TABLE "booking_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"service_id" uuid,
	"service_name" text NOT NULL,
	"duration" integer NOT NULL,
	"price" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"total" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"resource_id" uuid,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"source" "booking_source" NOT NULL,
	"status" "booking_status" DEFAULT 'CONFIRMED' NOT NULL,
	"cancellation_reason" text,
	"notes" text,
	"checked_in_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_end_after_start_check" CHECK ("bookings"."end_time" > "bookings"."start_time")
);
--> statement-breakpoint
CREATE TABLE "business_closures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"date" date NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"is_closed" boolean DEFAULT false NOT NULL,
	"open_time" time,
	"close_time" time,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "business_hours_closed_or_times_check" CHECK ("business_hours"."is_closed" = true OR ("business_hours"."open_time" IS NOT NULL AND "business_hours"."close_time" IS NOT NULL)),
	CONSTRAINT "business_hours_close_after_open_check" CHECK ("business_hours"."is_closed" = true OR "business_hours"."close_time" > "business_hours"."open_time")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_contact_check" CHECK ("customers"."phone" IS NOT NULL OR "customers"."email" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "member_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"phone" text,
	"email" text,
	"address" text,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"booking_interval" integer DEFAULT 30 NOT NULL,
	"min_advance_minutes" integer DEFAULT 0 NOT NULL,
	"cancellation_cutoff_hours" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "resource_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"is_unavailable" boolean DEFAULT false NOT NULL,
	"open_time" time,
	"close_time" time,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resource_schedules_unavail_or_times_check" CHECK ("resource_schedules"."is_unavailable" = true OR ("resource_schedules"."open_time" IS NOT NULL AND "resource_schedules"."close_time" IS NOT NULL)),
	CONSTRAINT "resource_schedules_close_after_open_check" CHECK ("resource_schedules"."is_unavailable" = true OR "resource_schedules"."close_time" > "resource_schedules"."open_time")
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"duration" integer NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_services" ADD CONSTRAINT "booking_services_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_services" ADD CONSTRAINT "booking_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_closures" ADD CONSTRAINT "business_closures_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_schedules" ADD CONSTRAINT "resource_schedules_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_schedules" ADD CONSTRAINT "resource_schedules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_services_booking_id_idx" ON "booking_services" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "bookings_org_date_status_idx" ON "bookings" USING btree ("organization_id","date","status");--> statement-breakpoint
CREATE INDEX "bookings_res_date_status_idx" ON "bookings" USING btree ("resource_id","date","status");--> statement-breakpoint
CREATE INDEX "bookings_customer_id_idx" ON "bookings" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_org_reference_unique" ON "bookings" USING btree ("organization_id","reference");--> statement-breakpoint
CREATE UNIQUE INDEX "business_closures_org_date_unique" ON "business_closures" USING btree ("organization_id","date");--> statement-breakpoint
CREATE INDEX "business_closures_org_date_idx" ON "business_closures" USING btree ("organization_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "business_hours_org_day_unique" ON "business_hours" USING btree ("organization_id","day_of_week");--> statement-breakpoint
CREATE INDEX "customers_org_phone_idx" ON "customers" USING btree ("organization_id","phone");--> statement-breakpoint
CREATE INDEX "customers_org_email_idx" ON "customers" USING btree ("organization_id","email");--> statement-breakpoint
CREATE INDEX "customers_user_id_idx" ON "customers" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "org_members_org_user_unique" ON "organization_members" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "org_members_user_id_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_unique" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "resource_schedules_res_day_unique" ON "resource_schedules" USING btree ("resource_id","day_of_week");--> statement-breakpoint
CREATE INDEX "resources_org_active_idx" ON "resources" USING btree ("organization_id","is_active");--> statement-breakpoint
CREATE INDEX "services_org_active_idx" ON "services" USING btree ("organization_id","is_active");