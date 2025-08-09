"use server";

import { baseUrl } from "@/utils/constants";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function deleteForm({ formId }: { formId: number }) {
  const cookieHeader = cookies()
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${baseUrl}/api/forms/delete/${formId}`, {
    method: "DELETE",
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
