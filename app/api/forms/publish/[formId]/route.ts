import { auth } from "@/auth";
import { db } from "@/db";
import { forms } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: { formId: string } }
) {
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

    if (form.published) {
      return Response.json(
        { error: "Form is already published" },
        { status: 400 }
      );
    }

    await db.update(forms).set({ published: true }).where(eq(forms.id, formId));

    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error(err);

    return Response.json(
      { error: "Something went wrong while publishing the form" },
      { status: 500 }
    );
  }
}
