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
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature") as string;
    console.log("[Webhook] Received request");

    const webhookSecret =
      process.env.NODE_ENV === "development"
        ? process.env.STRIPE_WEBHOOK_LOCAL_SECRET
        : process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("Webhook secret not set");
    }

    if (!sig) {
      console.log("[Webhook] Missing stripe-signature header");
      return new Response("Missing signature", { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("[Webhook] Signature verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    console.log("[Webhook] Event type:", event.type);

    if (!relevantEvents.has(event.type)) {
      console.log("[Webhook] Event not relevant, skipping");
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // Handle events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        console.log(
          "[Webhook] checkout.session.completed for customer:",
          customerId
        );

        if (session.subscription) {
          console.log(
            "[Webhook] Creating subscription for subscription ID:",
            session.subscription
          );
          await createSubscription({ stripeCustomerId: customerId });
        } else {
          console.log("[Webhook] No subscription found in session");
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(
          "[Webhook] customer.subscription.created for customer:",
          subscription.customer
        );
        await createSubscription({
          stripeCustomerId: subscription.customer as string,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(
          "[Webhook] customer.subscription.deleted for customer:",
          subscription.customer
        );
        await deleteSubscription({
          stripeCustomerId: subscription.customer as string,
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(
          "[Webhook] customer.subscription.updated for customer:",
          subscription.customer
        );
        // هنا ممكن تعمل update حسب احتياجاتك
        break;
      }

      default: {
        console.log("[Webhook] Unhandled event type:", event.type);
        break;
      }
    }

    console.log("[Webhook] Finished processing event:", event.type);
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error("[Webhook] Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
