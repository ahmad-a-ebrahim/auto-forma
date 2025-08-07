import { db } from "@/db";
import { formSubmissions, answers as dbAnswers, forms } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request): Promise<Response> {
  try {
    const data = await request.json();

    if (!data.formId || !Array.isArray(data.answers)) {
      return Response.json({ error: "Invalid data" }, { status: 400 });
    }

    const form = await db.query.forms.findFirst({
      where: eq(forms.id, data.formId),
    });

    if (!form) {
      return Response.json({ error: "Form not found" }, { status: 404 });
    }

    let insertedId: number | null = null;

    await db.transaction(async (tx) => {
      const newFormSubmission = await tx
        .insert(formSubmissions)
        .values({
          formId: data.formId,
        })
        .returning({
          insertedId: formSubmissions.id,
        });

      const [result] = newFormSubmission;
      insertedId = result.insertedId;

      for (const answer of data.answers) {
        await tx.insert(dbAnswers).values({
          formSubmissionId: insertedId!,
          ...answer,
        });
      }
    });

    return Response.json(
      { success: true, formSubmissionId: insertedId },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);

    return Response.json(
      { error: "Something went wrong while saving your answers" },
      { status: 500 }
    );
  }
}
