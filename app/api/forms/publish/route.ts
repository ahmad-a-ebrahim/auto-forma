import { db } from "@/db";
import { forms } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { formId } = await req.json();

    if (!formId) {
      return Response.json({ error: "Form ID is required" }, { status: 422 });
    }

    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
    });

    if (!form) {
      return Response.json({ error: "Form not found" }, { status: 404 });
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
