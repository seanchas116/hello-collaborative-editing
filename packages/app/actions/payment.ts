"use server";

import Stripe from "stripe";
import { stripe } from "@/utils/stripe/config";
import { createClient } from "@/utils/supabase/server";
import { getOrCreateStripeCustomer } from "@/usecases/stripe-customers/get-or-create";
import { changeSubscriptionQuantity } from "@/usecases/stripe-subscriptions/update";

export async function changeQuantity(quantity: number): Promise<void> {
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

    await changeSubscriptionQuantity(user.id, quantity);
  } catch (error) {
    console.error(error);
    throw new Error("Could not change quantity.");
  }
}

export async function checkoutWithStripe(returnURL: string): Promise<string> {
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
      customer = (await getOrCreateStripeCustomer(user)).customerId;
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
      cancel_url: returnURL,
      success_url: returnURL,
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

    console.log("Checkout session created:", session);

    return session.url;
  } catch (error) {
    console.error(error);
    throw new Error("Could not open checkout page.");
  }
}

export async function createStripePortal(returnURL: string) {
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
      customer = (await getOrCreateStripeCustomer(user)).customerId;
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
        return_url: returnURL,
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
    throw new Error("Could not open billing portal");
  }
}
