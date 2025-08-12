"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { forms } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function generateAnalytics({
  formId,
  questionsIds,
}: {
  formId: number;
  questionsIds: number[];
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId)
      return {
        success: false,
        message: "Unauthorized",
      };

    if (!formId || !questionsIds.length)
      return {
        success: false,
        message: "Invalid data",
      };

    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        questions: {
          with: {
            fieldOptions: true,
          },
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

    if (!form)
      return {
        success: false,
        message: "Form not found",
      };

    const questions = form.questions
      .filter((q) => questionsIds.includes(q.id))
      .filter((q) => q.fieldType === "RadioGroup" || q.fieldType === "Select");

    const result: Record<string, Record<string, number>> = {};

    questions.forEach((question) => {
      if (!result[question.text!]) {
        result[question.text!] = {};
      }

      question.fieldOptions.forEach((fieldOption) => {
        let count = 0;

        form.submissions.forEach((submit) => {
          submit.answers.forEach((answer) => {
            if (
              answer.questionId === question.id &&
              answer.fieldOption?.id === fieldOption.id
            ) {
              count++;
            }
          });
        });

        result[question.text!][fieldOption.text ?? ""] = count;
      });
    });

    return {
      success: true,
      data: result,
    };
  } catch (err) {
    console.error(err);

    return { success: false, message: "Failed to generate analytics" };
  }
}
