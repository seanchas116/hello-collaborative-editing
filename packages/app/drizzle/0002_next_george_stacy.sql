DO $$ BEGIN
 CREATE TYPE "stripe_subscription_status" AS ENUM('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stripe_customers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"customerId" text
);
alter table stripe_customers enable row level security;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stripe_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" uuid,
	"status" "stripe_subscription_status",
	"priceId" text,
	"metadata" jsonb,
	"data" jsonb
);
alter table stripe_subscriptions enable row level security;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stripe_customers" ADD CONSTRAINT "stripe_customers_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stripe_subscriptions" ADD CONSTRAINT "stripe_subscriptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
