ALTER TABLE "stripe_customers" ALTER COLUMN "customerId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stripe_subscriptions" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stripe_subscriptions" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stripe_subscriptions" ALTER COLUMN "priceId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stripe_subscriptions" ALTER COLUMN "metadata" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "stripe_subscriptions" ALTER COLUMN "data" SET NOT NULL;