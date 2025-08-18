"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAuthenticatedUser() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      error: "Unauthorized",
      user: null,
    };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return {
      error: "User not found",
      user: null,
    };
  }

  const fUser: any = {};

  Object.entries(user).forEach(([key, value]) => {
    fUser[key] = value;
  });

  delete fUser["password"];

  return {
    success: true,
    user: fUser,
  };
}
