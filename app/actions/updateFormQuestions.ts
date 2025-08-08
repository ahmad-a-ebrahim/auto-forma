"use server";

import { FieldType } from "@/types/form-types";
import { baseUrl } from "@/utils/constants";
import { revalidatePath } from "next/cache";

type UpdatePayload = {
  userId?: string;
  formId: number;
  name: string;
  description: string;
  questions: {
    id: number;
    text: string;
    fieldType: FieldType;
    fieldOptions: {
      text: string;
      value: string;
    }[];
    required?: boolean;
    order: number;
  }[];
};

export async function updateFormQuestions(payload: UpdatePayload) {
  const res = await fetch(`${baseUrl}/api/forms/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    revalidatePath("/");
  }

  return res.json();
}
