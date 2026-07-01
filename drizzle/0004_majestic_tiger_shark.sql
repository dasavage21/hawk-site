CREATE TABLE "lsa_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"license_number" text,
	"insurance_carrier" text,
	"insurance_policy_number" text,
	"status" text DEFAULT 'not_started' NOT NULL,
	"google_lsa_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lsa_profiles" ADD CONSTRAINT "lsa_profiles_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;