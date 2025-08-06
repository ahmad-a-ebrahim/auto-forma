"use server";

import { db } from "@/db";
import { forms, questions as dbQuestions, fieldOptions } from "@/db/schema";
import { auth } from "@/auth";
import { InferInsertModel, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type Form = InferInsertModel<typeof forms>;
type Question = InferInsertModel<typeof dbQuestions>;
type FieldOption = InferInsertModel<typeof fieldOptions>;

interface SaveFormData extends Form {
  questions: Array<Question & { fieldOptions?: FieldOption[] }>;
}

export async function saveForm(data: SaveFormData) {
  try {
    const { name, description } = data;

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const [newForm] = await db
      .insert(forms)
      .values({
        name,
        description,
        userId,
        published: false,
      })
      .returning({ insertedId: forms.id });

    const formId = newForm.insertedId;

    const newQuestions = data.questions.map((question, index) => ({
      text: question.text,
      fieldType: question.fieldType,
      fieldOptions: question.fieldOptions,
      formId,
      order: index,
    }));

    await db.transaction(async (tx) => {
      for (const question of newQuestions) {
        const [{ questionId }] = await tx
          .insert(dbQuestions)
          .values({
            text: question.text,
            fieldType: question.fieldType,
            formId: question.formId,
            order: question.order,
          })
          .returning({ questionId: dbQuestions.id });

        if (question.fieldOptions?.length) {
          await tx.insert(fieldOptions).values(
            question.fieldOptions.map((option) => ({
              text: option.text,
              value: option.value,
              questionId,
            }))
          );
        }
      }
    });

    return formId;
  } catch (err) {
    console.error("Error saving form:", err);
    throw new Error("Something went wrong while saving the form.");
  }
}

export async function publishForm(formId: number) {
  try {
    await db.update(forms).set({ published: true }).where(eq(forms.id, formId));
    revalidatePath("/");
  } catch (err) {
    console.error("Error publishing form:", err);
    throw new Error("Something went wrong while publishing the form.");
  }
}
