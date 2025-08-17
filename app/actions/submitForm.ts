"use server";

import { baseUrl } from "@/utils/constants";
import { cookies } from "next/headers";

export async function submitForm(data: {
  formId: number;
  isAnon: boolean;
  answers: {
    questionId: number;
    value: string | null;
    fieldOptionsId?: number | null;
  }[];
}) {
  const cookieHeader = cookies()
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${baseUrl}/api/forms/submit/${data.formId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ answers: data.answers, isAnon: data.isAnon }),
  });

  return res.json();
}
