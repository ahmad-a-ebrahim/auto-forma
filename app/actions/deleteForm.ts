"use server";

import { db } from "@/db";
import {
  answers,
  fieldOptions,
  formSubmissions,
  forms,
  questions,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteForm({
  formId,
  userId,
}: {
  formId: number;
  userId: string;
}) {
  try {
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
    });

    if (!form || form.userId !== userId) {
      throw new Error("Form not found or unauthorized");
    }

    const formQuestions = await db.query.questions.findMany({
      where: eq(questions.formId, formId),
    });
    const questionIds = formQuestions.map((q) => q.id);

    const formFieldOptions = questionIds.length
      ? await db.query.fieldOptions.findMany({
          where: inArray(fieldOptions.questionId, questionIds),
        })
      : [];
    const fieldOptionIds = formFieldOptions.map((o) => o.id);

    const submissions = await db.query.formSubmissions.findMany({
      where: eq(formSubmissions.formId, formId),
    });
    const submissionIds = submissions.map((s) => s.id);

    if (questionIds.length) {
      await db.delete(answers).where(inArray(answers.questionId, questionIds));
    }

    if (fieldOptionIds.length) {
      await db
        .delete(answers)
        .where(inArray(answers.fieldOptionsId, fieldOptionIds));
    }

    if (submissionIds.length) {
      await db
        .delete(answers)
        .where(inArray(answers.formSubmissionId, submissionIds));
      await db
        .delete(formSubmissions)
        .where(eq(formSubmissions.formId, formId));
    }

    if (fieldOptionIds.length) {
      await db
        .delete(fieldOptions)
        .where(inArray(fieldOptions.questionId, questionIds));
    }

    if (questionIds.length) {
      await db.delete(questions).where(eq(questions.formId, formId));
    }

    await db.delete(forms).where(eq(forms.id, formId));

    revalidatePath("/");
  } catch (err) {
    console.error("Error deleting form:", err);
    throw new Error("Something went wrong while deleting the form.");
  }
}
