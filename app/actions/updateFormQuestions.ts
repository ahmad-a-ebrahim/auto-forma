"use server";

import { db } from "@/db";
import { forms, questions, fieldOptions } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

type FieldType = "RadioGroup" | "Select" | "Input" | "Textarea" | "Switch";

type UpdatePayload = {
  formId: number;
  name: string;
  description: string;
  questions: {
    id: number;
    text: string;
    fieldType: FieldType;
    fieldOptions: {
      text: string;
      value: string;
    }[];
  }[];
};

export async function updateFormQuestions(payload: UpdatePayload) {
  try {
    const { formId, name, description, questions: updatedQs } = payload;

    await db.transaction(async (tx) => {
      // Update form info
      await tx
        .update(forms)
        .set({ name, description })
        .where(eq(forms.id, formId));

      // Get existing question IDs
      const existing = await tx.query.questions.findMany({
        where: eq(questions.formId, formId),
        columns: { id: true },
      });

      const existingIds = existing.map((q) => q.id);
      const updatedIds = updatedQs.map((q) => q.id);

      // Delete removed questions + options
      const toDelete = existingIds.filter((id) => !updatedIds.includes(id));
      if (toDelete.length) {
        await tx
          .delete(fieldOptions)
          .where(inArray(fieldOptions.questionId, toDelete));

        await tx.delete(questions).where(inArray(questions.id, toDelete));
      }

      // Insert new questions + options
      for (const q of updatedQs) {
        if (!existingIds.includes(q.id)) {
          const [inserted] = await tx
            .insert(questions)
            .values({
              formId,
              text: q.text,
              fieldType: q.fieldType,
            })
            .returning({ id: questions.id });

          if (q.fieldOptions.length) {
            await tx.insert(fieldOptions).values(
              q.fieldOptions.map((opt) => ({
                questionId: inserted.id,
                text: opt.text,
                value: opt.value,
              }))
            );
          }
        }
      }

      // Update existing questions + options
      const toUpdate = updatedQs.filter((q) => existingIds.includes(q.id));
      for (const q of toUpdate) {
        await tx
          .update(questions)
          .set({
            text: q.text,
            fieldType: q.fieldType,
          })
          .where(eq(questions.id, q.id));

        await tx.delete(fieldOptions).where(eq(fieldOptions.questionId, q.id));

        if (q.fieldOptions.length) {
          await tx.insert(fieldOptions).values(
            q.fieldOptions.map((opt) => ({
              questionId: q.id,
              text: opt.text,
              value: opt.value,
            }))
          );
        }
      }
    });

    return { success: true };
  } catch (err) {
    console.error("Error updating form questions:", err);
    throw new Error("Something went wrong while updating the form.");
  }
}
