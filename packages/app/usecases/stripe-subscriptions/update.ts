import { db } from "@/db/db";
import {
  StripeSubscription,
  StripeSubscriptionInsert,
  stripeCustomers,
  stripeSubscriptions,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/utils/stripe/config";
import { getSubscriptionForUser } from "./get";

export type { StripeSubscription };

export async function updateSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

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

  const values: Omit<StripeSubscriptionInsert, "userId"> = {
    id: subscription.id,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
    quantity: subscription.items.data[0].quantity,
    metadata: subscription.metadata,
    data: subscription,
  };

  await db
    .insert(stripeSubscriptions)
    .values({
      userId: customer.userId,
      ...values,
    })
    .onConflictDoUpdate({
      target: stripeCustomers.userId,
      set: values,
    });
}

export async function changeSubscriptionQuantity(
  userId: string,
  quantity: number
) {
  const subscriptionId = (await getSubscriptionForUser(userId))?.id;

  if (!subscriptionId) {
    throw new Error("Subscription not found");
  }
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionItemId = subscription.items.data.find(
    (item) => item.price.id === process.env.STRIPE_PRICE_ID
  )?.id;
  if (!subscriptionItemId) {
    throw new Error("Subscription item not found");
  }

  await stripe.subscriptions.update(subscriptionId, {
    items: [{ id: subscriptionItemId, quantity }],
  });

  await db
    .update(stripeSubscriptions)
    .set({ quantity })
    .where(eq(stripeSubscriptions.id, subscriptionId));
}
