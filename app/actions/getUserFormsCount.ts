"use server";

import { db } from "@/db";
import { forms } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserFormsCount(userId: string) {
  try {
    const userForms = await db.query.forms.findMany({
      where: eq(forms.userId, userId),
    });

    return userForms.length;
  } catch (err) {
    console.error("Error fetching user forms count:", err);
    return 0;
  }
}
