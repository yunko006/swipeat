CREATE TYPE "public"."timing_correction_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TABLE "swipeat_timing_corrections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"step_index" integer NOT NULL,
	"suggested_start_time" integer NOT NULL,
	"suggested_end_time" integer NOT NULL,
	"created_by_user_id" text NOT NULL,
	"status" "timing_correction_status" DEFAULT 'pending' NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "swipeat_timing_corrections" ADD CONSTRAINT "swipeat_timing_corrections_recipe_id_swipeat_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."swipeat_recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipeat_timing_corrections" ADD CONSTRAINT "swipeat_timing_corrections_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;