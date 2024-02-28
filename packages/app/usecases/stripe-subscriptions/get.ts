import { db } from "@/db/db";
import { StripeSubscription, stripeSubscriptions } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getSubscriptionForUser(
  userId: string
): Promise<StripeSubscription> {
  const subscriptions = await db
    .select()
    .from(stripeSubscriptions)
    .where(
      and(
        eq(stripeSubscriptions.status, "active"),
        eq(stripeSubscriptions.userId, userId)
      )
    );

  if (subscriptions.length === 0) {
    throw new Error("No active subscription found");
  }

  return subscriptions[0];
}
