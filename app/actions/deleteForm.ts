"use server";

import { baseUrl } from "@/utils/constants";
import { revalidatePath } from "next/cache";

export async function deleteForm({
  formId,
  userId,
}: {
  formId: number;
  userId: string;
}) {
  const res = await fetch(`${baseUrl}/api/forms/delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ formId, userId }),
  });

  if (res.ok) {
    revalidatePath("/");
  }

  return res.json();
}
