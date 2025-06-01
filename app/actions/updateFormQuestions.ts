'use server';

import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { questions, fieldOptions } from '@/db/schema';

type QuestionPayload = {
  id: number;
  text: string | null;
  fieldType: "RadioGroup" | "Select" | "Input" | "Textarea" | "Switch" | null;
  fieldOptions: Array<{
    id?: number;
    text: string | null;
    value: string | null;
  }>;
};

type UpdatePayload = {
  formId: number;
  questions: QuestionPayload[];
};

export async function updateFormQuestions(payload: UpdatePayload) {
  const { formId, questions: updatedQuestions } = payload;

  for (const q of updatedQuestions) {
    await db
      .update(questions)
      .set({ text: q.text, fieldType: q.fieldType })
      .where(eq(questions.id, q.id));

    // Delete all current field options
    await db.delete(fieldOptions).where(eq(fieldOptions.questionId, q.id));

    // Re-insert new field options
    if (q.fieldOptions.length) {
      await db.insert(fieldOptions).values(
        q.fieldOptions.map(opt => ({
          questionId: q.id,
          text: opt.text,
          value: opt.value,
        }))
      );
    }
  }

  return { success: true };
}
