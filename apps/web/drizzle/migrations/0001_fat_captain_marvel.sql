CREATE TYPE "public"."language" AS ENUM('en', 'hi');--> statement-breakpoint
CREATE TYPE "public"."theme" AS ENUM('system', 'light', 'dark');--> statement-breakpoint
CREATE TABLE "app_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid NOT NULL,
	"display_name" text,
	"avatar_image_url" text,
	"preferred_language" "language" DEFAULT 'en' NOT NULL,
	"theme" "theme" DEFAULT 'system' NOT NULL,
	"timezone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_users_auth_user_id_unique" UNIQUE("auth_user_id")
);
--> statement-breakpoint
ALTER TABLE "customers" DROP CONSTRAINT "customers_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "organization_members" DROP CONSTRAINT "organization_members_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "app_users" ADD CONSTRAINT "app_users_auth_user_id_users_id_fk" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;