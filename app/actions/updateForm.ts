"use server";

import { FieldType } from "@/types/form-types";
import { baseUrl } from "@/utils/constants";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

type UpdatePayload = {
  formId: number;
  data: {
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
};

export async function updateForm(payload: UpdatePayload) {
  const cookieHeader = cookies()
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${baseUrl}/api/forms/update/${payload.formId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(payload.data),
  });

  if (res.ok) {
    revalidatePath("/");
  }

  return res.json();
}
