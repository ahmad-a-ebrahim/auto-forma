"use server";

import { forms, questions as dbQuestions, fieldOptions } from "@/db/schema";
import { InferInsertModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { baseUrl } from "@/utils/constants";
import { cookies } from "next/headers";

type Form = InferInsertModel<typeof forms>;
type Question = InferInsertModel<typeof dbQuestions>;
type FieldOption = InferInsertModel<typeof fieldOptions>;

interface SaveFormData extends Form {
  questions: Array<Question & { fieldOptions?: FieldOption[] }>;
}

const cookieHeader = cookies()
  .getAll()
  .map((c) => `${c.name}=${c.value}`)
  .join("; ");

export async function saveForm(data: SaveFormData) {
  const res = await fetch(`${baseUrl}/api/forms/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function publishForm({ formId }: { formId: number }) {
  const res = await fetch(`${baseUrl}/api/forms/publish/${formId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  });

  if (res.ok) {
    revalidatePath("/");
  }

  return res.json();
}
