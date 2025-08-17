import { auth } from "@/auth";
import { db } from "@/db";
import { formSubmissions, answers as dbAnswers, forms } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: { formId: string } }
): Promise<Response> {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const formId = parseInt(params.formId);

    if (!formId) {
      return Response.json({ error: "Form ID is required" }, { status: 400 });
    }

    const data = await request.json();

    if (!Array.isArray(data.answers)) {
      return Response.json({ error: "Invalid data" }, { status: 400 });
    }

    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
    });

    if (!form) {
      return Response.json({ error: "Form not found" }, { status: 404 });
    }

    let insertedId: number | null = null;

    await db.transaction(async (tx) => {
      const newFormSubmission = await tx
        .insert(formSubmissions)
        .values({
          userId: data.isAnon ? null : userId,
          formId,
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
