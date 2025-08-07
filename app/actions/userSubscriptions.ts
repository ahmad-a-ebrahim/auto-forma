"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createSubscription({
  stripeCustomerId,
}: {
  stripeCustomerId: string;
}) {
  try {
    await db
      .update(users)
      .set({
        subscribed: true,
      })
      .where(eq(users.stripeCustomerId, stripeCustomerId));
  } catch (err) {
    console.error(err);
    throw new Error("Failed to create subscription.");
  }
}

export async function deleteSubscription({
  stripeCustomerId,
}: {
  stripeCustomerId: string;
}) {
  try {
    await db
      .update(users)
      .set({
        subscribed: false,
      })
      .where(eq(users.stripeCustomerId, stripeCustomerId));
  } catch (err) {
    console.error(err);
    throw new Error("Failed to delete subscription.");
  }
}

export async function getUserSubscription({ userId }: { userId: string }) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return user?.subscribed ?? false;
  } catch (err) {
    console.error(err);
    return false;
  }
}
