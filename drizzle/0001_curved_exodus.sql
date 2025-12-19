CREATE TYPE "public"."source_platform" AS ENUM('tiktok', 'instagram', 'youtube');--> statement-breakpoint
CREATE TABLE "swipeat_collection_recipes" (
	"collection_id" uuid NOT NULL,
	"recipe_id" uuid NOT NULL,
	"added_at" timestamp with time zone NOT NULL,
	CONSTRAINT "swipeat_collection_recipes_collection_id_recipe_id_pk" PRIMARY KEY("collection_id","recipe_id")
);
--> statement-breakpoint
CREATE TABLE "swipeat_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "swipeat_collections_user_id_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
CREATE TABLE "swipeat_recipe_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"recipe_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "swipeat_recipe_likes" (
	"user_id" text NOT NULL,
	"recipe_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "swipeat_recipe_likes_user_id_recipe_id_pk" PRIMARY KEY("user_id","recipe_id")
);
--> statement-breakpoint
CREATE TABLE "swipeat_recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_url" text NOT NULL,
	"source_platform" "source_platform" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image_url" text,
	"ingredients" jsonb NOT NULL,
	"steps" jsonb NOT NULL,
	"prep_time_minutes" integer,
	"cook_time_minutes" integer,
	"servings" integer,
	"extraction_model" text,
	"created_at" timestamp with time zone NOT NULL,
	"created_by_user_id" text,
	CONSTRAINT "swipeat_recipes_source_url_unique" UNIQUE("source_url")
);
--> statement-breakpoint
CREATE TABLE "swipeat_user_recipe_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"recipe_id" uuid NOT NULL,
	"viewed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "swipeat_user_saved_recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"recipe_id" uuid NOT NULL,
	"saved_at" timestamp with time zone NOT NULL,
	"is_favorite" boolean NOT NULL,
	"notes" text,
	CONSTRAINT "swipeat_user_saved_recipes_user_id_recipe_id_unique" UNIQUE("user_id","recipe_id")
);
--> statement-breakpoint
ALTER TABLE "swipeat_collection_recipes" ADD CONSTRAINT "swipeat_collection_recipes_collection_id_swipeat_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."swipeat_collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipeat_collection_recipes" ADD CONSTRAINT "swipeat_collection_recipes_recipe_id_swipeat_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."swipeat_recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipeat_collections" ADD CONSTRAINT "swipeat_collections_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipeat_recipe_comments" ADD CONSTRAINT "swipeat_recipe_comments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipeat_recipe_comments" ADD CONSTRAINT "swipeat_recipe_comments_recipe_id_swipeat_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."swipeat_recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipeat_recipe_likes" ADD CONSTRAINT "swipeat_recipe_likes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipeat_recipe_likes" ADD CONSTRAINT "swipeat_recipe_likes_recipe_id_swipeat_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."swipeat_recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipeat_recipes" ADD CONSTRAINT "swipeat_recipes_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipeat_user_recipe_views" ADD CONSTRAINT "swipeat_user_recipe_views_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipeat_user_recipe_views" ADD CONSTRAINT "swipeat_user_recipe_views_recipe_id_swipeat_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."swipeat_recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipeat_user_saved_recipes" ADD CONSTRAINT "swipeat_user_saved_recipes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipeat_user_saved_recipes" ADD CONSTRAINT "swipeat_user_saved_recipes_recipe_id_swipeat_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."swipeat_recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_views_idx" ON "swipeat_user_recipe_views" USING btree ("user_id","viewed_at");