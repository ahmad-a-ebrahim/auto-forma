import { auth } from "@/auth";
import { db } from "@/db";
import {
  answers,
  fieldOptions,
  formSubmissions,
  forms,
  questions,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function DELETE(
  request: Request,
  { params }: { params: { formId: string } }
): Promise<Response> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formId = parseInt(params.formId);

    if (!formId) {
      return Response.json({ error: "Form ID is required" }, { status: 400 });
    }

    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
    });

    if (!form) {
      return Response.json({ error: "Form not found" }, { status: 404 });
    }

    if (form.userId !== userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.transaction(async (tx) => {
      const formQuestions = await tx.query.questions.findMany({
        where: eq(questions.formId, formId),
      });
      const questionIds = formQuestions.map((q) => q.id);

      const formFieldOptions = questionIds.length
        ? await tx.query.fieldOptions.findMany({
            where: inArray(fieldOptions.questionId, questionIds),
          })
        : [];
      const fieldOptionIds = formFieldOptions.map((o) => o.id);

      const submissions = await tx.query.formSubmissions.findMany({
        where: eq(formSubmissions.formId, formId),
      });
      const submissionIds = submissions.map((s) => s.id);

      if (questionIds.length) {
        await tx
          .delete(answers)
          .where(inArray(answers.questionId, questionIds));
      }

      if (fieldOptionIds.length) {
        await tx
          .delete(answers)
          .where(inArray(answers.fieldOptionsId, fieldOptionIds));
      }

      if (submissionIds.length) {
        await tx
          .delete(answers)
          .where(inArray(answers.formSubmissionId, submissionIds));
        await tx
          .delete(formSubmissions)
          .where(eq(formSubmissions.formId, formId));
      }

      if (fieldOptionIds.length) {
        await tx
          .delete(fieldOptions)
          .where(inArray(fieldOptions.questionId, questionIds));
      }

      if (questionIds.length) {
        await tx.delete(questions).where(eq(questions.formId, formId));
      }

      await tx.delete(forms).where(eq(forms.id, formId));
    });

    return Response.json({ success: true, formId }, { status: 200 });
  } catch (err: any) {
    console.error(err);

    return Response.json(
      { error: "Something went wrong while deleting the form" },
      { status: 500 }
    );
  }
}
