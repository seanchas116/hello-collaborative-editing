import Stripe from "stripe";
import { db } from "@/db/db";
import {
  StripeSubscription,
  stripeCustomers,
  stripeSubscriptions,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export type { StripeSubscription };

export async function updateStripeSubscription(
  subscription: Stripe.Subscription
) {
  const customerId =
    typeof subscription.customer === "object"
      ? subscription.customer.id
      : subscription.customer;

  const customer = (
    await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.customerId, customerId))
  ).at(0);

  if (!customer) {
    throw new Error("Customer not found");
  }

  await db.insert(stripeSubscriptions).values({
    userId: customer.userId,
    id: subscription.id,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
    metadata: subscription.metadata,
    data: subscription,
  });
}
