"use server";

import { db } from "@/db";
import { forms } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserFormsCount(userId: string) {
  const userForms = await db.query.forms.findMany({
    where: eq(forms.userId, userId),
  });

  return userForms.length;
}