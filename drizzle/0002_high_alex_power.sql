CREATE TABLE "keyword_rankings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"keyword" text NOT NULL,
	"position" integer,
	"previous_position" integer,
	"search_volume" integer,
	"checked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "ad_campaigns" CASCADE;--> statement-breakpoint
DROP TABLE "ad_performance" CASCADE;--> statement-breakpoint
DROP TABLE "ad_variations" CASCADE;--> statement-breakpoint
ALTER TABLE "keyword_rankings" ADD CONSTRAINT "keyword_rankings_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;