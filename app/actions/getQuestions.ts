"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { forms, questions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getQuestions({ formId }: { formId: number }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId)
      return {
        success: false,
        message: "Unauthorized",
      };

    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
    });

    if (!form)
      return {
        success: false,
        message: "Form not found",
      };

    if (userId !== form.userId)
      return {
        success: false,
        message: "Forbidden",
      };

    const qs = await db.query.questions.findMany({
      where: eq(questions.formId, formId),
    });

    return { success: true, data: qs };
  } catch (err) {
    console.error(err);

    return { success: false, message: "Failed to fetch questions" };
  }
}
