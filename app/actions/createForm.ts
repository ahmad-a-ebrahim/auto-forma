"use server";

import { db } from "@/db";
import { forms, questions, fieldOptions } from "@/db/schema";
import { revalidatePath } from "next/cache";

type FieldType = "RadioGroup" | "Select" | "Input" | "Textarea" | "Switch";

type CreatePayload = {
  userId: string;
  name: string;
  description: string;
  questions: {
    id: number;
    text: string;
    fieldType: FieldType;
    fieldOptions: { text: string; value: string }[];
    required?: boolean;
    order: number;
  }[];
};

export async function createForm(payload: CreatePayload) {
  try {
    const { userId, name, description, questions: qs } = payload;

    const [newForm] = await db
      .insert(forms)
      .values({
        userId,
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
          required: q.required,
          order: q.order,
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

    revalidatePath("/");
    return { id: newForm.id };
  } catch (err) {
    console.error("Error creating form:", err);
    throw new Error("Something went wrong while creating the form.");
  }
}
