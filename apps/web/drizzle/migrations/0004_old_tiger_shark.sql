ALTER TABLE "organizations" ADD COLUMN "currency_code" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "locale" text DEFAULT 'en-US' NOT NULL;