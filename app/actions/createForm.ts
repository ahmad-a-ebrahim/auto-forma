"use server";

import { db } from "@/db";
import { forms, questions, fieldOptions } from "@/db/schema";

type CreatePayload = {
  userId: string;
  name: string;
  description: string;
  questions: {
    id: number;
    text: string;
    fieldType: string;
    fieldOptions: { text: string; value: string }[];
  }[];
};

export async function createForm(payload: CreatePayload) {
  const { userId, name, description, questions: qs } = payload;

  const [newForm] = await db
    .insert(forms)
    .values({
      userId, // 👈 نربطه مع اليوزر
      name,
      description,
      published: false,
    })
    .returning({ id: forms.id });

  for (const q of qs) {
    const [newQuestion] = await db
      .insert(questions)
      .values({
        formId: newForm.id,
        text: q.text,
        fieldType: q.fieldType,
      })
      .returning({ id: questions.id });

    if (q.fieldOptions?.length) {
      await db.insert(fieldOptions).values(
        q.fieldOptions.map((opt) => ({
          questionId: newQuestion.id,
          text: opt.text,
          value: opt.value,
        }))
      );
    }
  }

  return { id: newForm.id };
}
