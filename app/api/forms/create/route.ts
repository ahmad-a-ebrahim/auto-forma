import { auth } from "@/auth";
import { db } from "@/db";
import { forms, questions, fieldOptions } from "@/db/schema";

export async function POST(request: Request): Promise<Response> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, questions: qs } = data;

    if (!name || !description || !Array.isArray(qs)) {
      return Response.json({ error: "Invalid data" }, { status: 400 });
    }

    const result = await db.transaction(async (tx) => {
      const [newForm] = await tx
        .insert(forms)
        .values({
          userId,
          name,
          description,
          published: false,
        })
        .returning({ id: forms.id });

      for (const q of qs) {
        const [newQuestion] = await tx
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
          await tx.insert(fieldOptions).values(
            q.fieldOptions.map((opt: any) => ({
              questionId: newQuestion.id,
              text: opt.text,
              value: opt.value,
            }))
          );
        }
      }

      return newForm;
    });

    return Response.json({ success: true, id: result.id }, { status: 201 });
  } catch (err) {
    console.error(err);

    return Response.json(
      { error: "Something went wrong while creating the form" },
      { status: 500 }
    );
  }
}
