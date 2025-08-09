"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { forms, questions } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getResults({ formId }: { formId: number }) {
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
      with: {
        questions: {
          with: {
            fieldOptions: true,
          },
          orderBy: asc(questions.order),
        },
        submissions: {
          with: {
            answers: {
              with: {
                fieldOption: true,
              },
            },
          },
        },
      },
    });

    if (!form || !form.published) {
      return {
        success: false,
        message: "Form not found",
      };
    }

    if (userId !== form.userId)
      return {
        success: false,
        message: "Forbidden",
      };

    return {
      success: true,
      form,
    };
  } catch (err) {
    console.error(err);

    return {
      success: false,
      message: "Something went wrong while getting the results",
    };
  }
}
