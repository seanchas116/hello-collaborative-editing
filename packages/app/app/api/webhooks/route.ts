import Stripe from "stripe";
import { stripe } from "@/utils/stripe/config";
import { updateStripeSubscription } from "@/models/stripeSubscription";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret)
      return new Response("Webhook secret not found.", { status: 400 });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`🔔  Webhook received: ${event.type}`);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await updateStripeSubscription(event.data.object);
        break;
      case "checkout.session.completed":
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode === "subscription") {
          await updateStripeSubscription(
            checkoutSession.subscription as Stripe.Subscription
          );
        }
        break;
      default:
        return new Response(`Unsupported event type: ${event.type}`, {
          status: 400,
        });
    }
  } catch (error) {
    console.log(error);
    return new Response(
      "Webhook handler failed. View your Next.js function logs.",
      { status: 400 }
    );
  }

  return new Response(JSON.stringify({ received: true }));
}
