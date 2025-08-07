import { db } from "@/db";
import { forms, questions, fieldOptions } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function POST(request: Request): Promise<Response> {
  try {
    const data = await request.json();
    const { userId, formId, name, description, questions: updatedQs } = data;

    if (
      !userId ||
      !formId ||
      !name ||
      !description ||
      !Array.isArray(updatedQs)
    ) {
      return Response.json({ error: "Invalid data" }, { status: 400 });
    }

    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
    });

    if (!form) {
      return Response.json({ error: "Form not found" }, { status: 404 });
    }

    if (String(form.userId) !== String(userId)) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (form.published) {
      return Response.json(
        { error: "Form is published, you can not modify it" },
        { status: 400 }
      );
    }

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
      const updatedIds = updatedQs.map((q: any) => q.id);

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
              required: q.required,
              order: q.order,
            })
            .returning({ id: questions.id });

          if (q.fieldOptions?.length) {
            await tx.insert(fieldOptions).values(
              q.fieldOptions.map((opt: any) => ({
                questionId: inserted.id,
                text: opt.text,
                value: opt.value,
              }))
            );
          }
        }
      }

      // Update existing questions + options
      const toUpdate = updatedQs.filter((q: any) => existingIds.includes(q.id));
      for (const q of toUpdate) {
        await tx
          .update(questions)
          .set({
            text: q.text,
            fieldType: q.fieldType,
            required: q.required,
            order: q.order,
          })
          .where(eq(questions.id, q.id));

        await tx.delete(fieldOptions).where(eq(fieldOptions.questionId, q.id));

        if (q.fieldOptions?.length) {
          await tx.insert(fieldOptions).values(
            q.fieldOptions.map((opt: any) => ({
              questionId: q.id,
              text: opt.text,
              value: opt.value,
            }))
          );
        }
      }
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error(err);

    return Response.json(
      { error: "Something went wrong while updating the form" },
      { status: 500 }
    );
  }
}
