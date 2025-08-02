import { db } from "@/db";
import { formSubmissions, answers as dbAnswers } from "@/db/schema";

export async function POST(request: Request): Promise<Response> {
  try {
    const data = await request.json();

    // validation
    if (!data.formId || !Array.isArray(data.answers)) {
      return Response.json({ error: "Invalid request data" }, { status: 400 });
    }

    const newFormSubmission = await db
      .insert(formSubmissions)
      .values({
        formId: data.formId,
      })
      .returning({
        insertedId: formSubmissions.id,
      });

    const [{ insertedId }] = newFormSubmission;

    await db.transaction(async (tx) => {
      for (const answer of data.answers) {
        await tx.insert(dbAnswers).values({
          formSubmissionId: insertedId,
          ...answer,
        });
      }
    });

    return Response.json({ formSubmissionId: insertedId }, { status: 200 });
  } catch (err) {
    console.error("Error creating form submission:", err);
    return Response.json(
      { error: "Something went wrong while saving your answers." },
      { status: 500 }
    );
  }
}
