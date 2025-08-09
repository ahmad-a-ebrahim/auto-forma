import { auth } from "@/auth";
import { db } from "@/db";
import { forms, questions as dbQuestions, fieldOptions } from "@/db/schema";
import { InferInsertModel } from "drizzle-orm";

type Form = InferInsertModel<typeof forms>;
type Question = InferInsertModel<typeof dbQuestions>;
type FieldOption = InferInsertModel<typeof fieldOptions>;

interface SaveFormData extends Form {
  questions: Array<Question & { fieldOptions?: FieldOption[] }>;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = (await req.json()) as SaveFormData;
    const { name, description, questions } = data;

    if (!name || !description || !Array.isArray(questions)) {
      return Response.json({ error: "Invalid data" }, { status: 400 });
    }

    const [newForm] = await db
      .insert(forms)
      .values({
        name,
        description,
        userId,
        published: false,
      })
      .returning({ id: forms.id });

    const formId = newForm.id;

    const newQuestions = questions.map((question, index) => ({
      text: question.text,
      fieldType: question.fieldType,
      fieldOptions: question.fieldOptions,
      formId,
      order: index,
    }));

    await db.transaction(async (tx) => {
      for (const question of newQuestions) {
        const [{ id: questionId }] = await tx
          .insert(dbQuestions)
          .values({
            text: question.text,
            fieldType: question.fieldType,
            formId: question.formId,
            order: question.order,
          })
          .returning({ id: dbQuestions.id });

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

    return Response.json({ success: true, formId }, { status: 201 });
  } catch (err) {
    console.error(err);

    return Response.json(
      { error: "Something went wrong while saving the form" },
      { status: 500 }
    );
  }
}
