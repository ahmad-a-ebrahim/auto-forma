"use server";

import { baseUrl } from "@/utils/constants";

export async function submitForm(data: {
  formId: number;
  answers: {
    questionId: number;
    value: string | null;
    fieldOptionsId?: number | null;
  }[];
}) {
  const res = await fetch(`${baseUrl}/api/forms/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}
