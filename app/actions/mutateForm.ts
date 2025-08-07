"use server";

import { forms, questions as dbQuestions, fieldOptions } from "@/db/schema";
import { InferInsertModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { baseUrl } from "@/utils/constants";

type Form = InferInsertModel<typeof forms>;
type Question = InferInsertModel<typeof dbQuestions>;
type FieldOption = InferInsertModel<typeof fieldOptions>;

interface SaveFormData extends Form {
  questions: Array<Question & { fieldOptions?: FieldOption[] }>;
}

export async function saveForm(data: SaveFormData) {
  const res = await fetch(`${baseUrl}/api/forms/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function publishForm(formId: number) {
  const res = await fetch(`${baseUrl}/api/forms/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ formId }),
  });

  if (res.ok) {
    revalidatePath("/");
  }

  return res.json();
}
