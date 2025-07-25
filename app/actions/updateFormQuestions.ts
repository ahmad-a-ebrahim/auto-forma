"use server";

import { db } from "@/db";
import { forms, questions, fieldOptions } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

type UpdatePayload = {
  formId: number;
  name: string;
  description: string;
  questions: {
    id: number;
    text: string;
    fieldType: string;
    fieldOptions: {
      text: string;
      value: string;
    }[];
  }[];
};

export async function updateFormQuestions(payload: UpdatePayload) {
  const { formId, name, description, questions: updatedQs } = payload;

  await db
    .update(forms)
    .set({
      name,
      description,
    })
    .where(eq(forms.id, formId));

  const existing = await db.query.questions.findMany({
    where: eq(questions.formId, formId),
    columns: { id: true },
  });

  const existingIds = existing.map((q) => q.id);
  const updatedIds = updatedQs.map((q) => q.id);

  const toDelete = existingIds.filter((id) => !updatedIds.includes(id));
  if (toDelete.length) {
    // Delete their options first
    await db
      .delete(fieldOptions)
      .where(inArray(fieldOptions.questionId, toDelete));

    // Delete the questions
    await db.delete(questions).where(inArray(questions.id, toDelete));
  }

  for (const q of updatedQs) {
    if (!existingIds.includes(q.id)) {
      const [inserted] = await db
        .insert(questions)
        .values({
          formId,
          text: q.text,
          fieldType: q.fieldType,
        })
        .returning({ id: questions.id });

      if (q.fieldOptions.length) {
        await db.insert(fieldOptions).values(
          q.fieldOptions.map((opt) => ({
            questionId: inserted.id,
            text: opt.text,
            value: opt.value,
          }))
        );
      }
    }
  }

  const toUpdate = updatedQs.filter((q) => existingIds.includes(q.id));
  for (const q of toUpdate) {
    await db
      .update(questions)
      .set({
        text: q.text,
        fieldType: q.fieldType,
      })
      .where(eq(questions.id, q.id));

    await db.delete(fieldOptions).where(eq(fieldOptions.questionId, q.id));

    if (q.fieldOptions.length) {
      await db.insert(fieldOptions).values(
        q.fieldOptions.map((opt) => ({
          questionId: q.id,
          text: opt.text,
          value: opt.value,
        }))
      );
    }
  }

  return { success: true };
}
