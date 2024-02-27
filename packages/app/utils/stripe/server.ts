"use server";

import Stripe from "stripe";
import { stripe } from "@/utils/stripe/config";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { stripeCustomers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { User } from "@supabase/supabase-js";

type CheckoutResponse = {
  errorRedirect?: string;
  sessionId?: string;
};

async function createOrRetrieveCustomer(user: User) {
  const stripeCustomer = (
    await db
      .select()
      .from(stripeCustomers)
      .where(eq(stripeCustomers.userId, user.id))
  ).at(0);
  if (stripeCustomer) {
    return stripeCustomer.customerId;
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

  return newCustomer.id;
}

export async function checkoutWithStripe(): Promise<CheckoutResponse> {
  try {
    // Get the user from Supabase auth
    const supabase = createClient();
    const {
      error,
      data: { user },
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error(error);
      throw new Error("Could not get user session.");
    }

    // Retrieve or create the customer in Stripe
    let customer: string;
    try {
      customer = await createOrRetrieveCustomer(user);
    } catch (err) {
      console.error(err);
      throw new Error("Unable to access customer record.");
    }

    let params: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      allow_promotion_codes: true,
      billing_address_collection: "required",
      customer,
      customer_update: {
        address: "auto",
      },
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      cancel_url: process.env.NEXT_PUBLIC_SITE_URL,
      success_url: process.env.NEXT_PUBLIC_SITE_URL,
    };

    // Create a checkout session in Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.create(params);
    } catch (err) {
      console.error(err);
      throw new Error("Unable to create checkout session.");
    }

    if (!session.url) {
      throw new Error("Could not create checkout session.");
    }

    redirect(session.url);
  } catch (error) {
    console.error(error);
    redirect("/error");
  }
}

export async function createStripePortal(currentPath: string) {
  try {
    const supabase = createClient();
    const {
      error,
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      if (error) {
        console.error(error);
      }
      throw new Error("Could not get user session.");
    }

    let customer;
    try {
      customer = await createOrRetrieveCustomer(user);
    } catch (err) {
      console.error(err);
      throw new Error("Unable to access customer record.");
    }

    if (!customer) {
      throw new Error("Could not get customer.");
    }

    try {
      const { url } = await stripe.billingPortal.sessions.create({
        customer,
        return_url: process.env.NEXT_PUBLIC_SITE_URL,
      });
      if (!url) {
        throw new Error("Could not create billing portal");
      }
      return url;
    } catch (err) {
      console.error(err);
      throw new Error("Could not create billing portal");
    }
  } catch (error) {
    console.error(error);
    redirect("/error");
  }
}
