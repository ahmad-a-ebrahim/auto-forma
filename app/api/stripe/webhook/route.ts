import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import {
  createSubscription,
  deleteSubscription,
} from "@/app/actions/userSubscriptions";

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.created",
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  const webhookSecret =
  process.env.NODE_ENV === "development"
    ? process.env.STRIPE_WEBHOOK_LOCAL_SECRET
    : process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_LOCAL_SECRET is not set");
  }

  if (!sig) return;

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    webhookSecret
  );

  const data = event.data.object as Stripe.Subscription;

  if (relevantEvents.has(event.type)) {
    switch (event.type) {
      case "customer.subscription.created": {
        await createSubscription({
          stripeCustomerId: data.customer as string,
        });
        break;
      }
      case "customer.subscription.deleted": {
        await deleteSubscription({
          stripeCustomerId: data.customer as string,
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
  });
}
