import { stripe } from "@/lib/stripe/config";
import { db } from "@/db/db";
import { StripeCustomer, stripeCustomers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { User } from "@supabase/supabase-js";

export async function getOrCreateStripeCustomer(
  user: User
): Promise<StripeCustomer> {
  const stripeCustomer = (
    await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.userId, user.id))
  ).at(0);
  if (stripeCustomer) {
    return stripeCustomer;
  }

  if (!user.email) {
    throw new Error("User email not found");
  }

  const customerData = {
    metadata: { supabaseUUID: user.id },
    email: user.email,
  };
  const newCustomer = await stripe.customers.create(customerData);
  if (!newCustomer) throw new Error("Stripe customer creation failed.");

  const [result] = await db
    .insert(stripeCustomers)
    .values({
      userId: user.id,
      customerId: newCustomer.id,
    })
    .returning();

  return result;
}
