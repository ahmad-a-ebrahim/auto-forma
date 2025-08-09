import React from "react";
import { db } from "@/db";
import { forms, questions } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import MessageUI from "@/components/MessageUI";
import error from "@/public/error.svg";
import EditForm from "@/components/forms/EditForm";

const EditFormPage = async ({
  params,
}: {
  params: {
    formId: string;
  };
}) => {
  const formId = params.formId;

  if (!formId) {
    return <MessageUI image={error} message="Form not found" />;
  }

  const session = await auth();
  const userId = session?.user?.id;
  const form = await db.query.forms.findFirst({
    where: eq(forms.id, parseInt(formId)),
    with: {
      questions: {
        with: {
          fieldOptions: true,
        },
        orderBy: asc(questions.order),
      },
    },
  });

  if (!form) {
    return <MessageUI image={error} message="Form not found" />;
  }

  if (userId !== form?.userId) {
    return (
      <MessageUI
        image={error}
        message="You are not authorized to view this page"
      />
    );
  }

  const sanitizedForm = {
    ...form,
    name: form.name ?? "",
    description: form.description ?? "",
    published: form.published ?? false,
    questions: form.questions.map((q) => ({
      ...q,
      text: q.text ?? "",
      fieldType: q.fieldType ?? "Input",
      fieldOptions: q.fieldOptions.map((opt) => ({
        ...opt,
        text: opt.text ?? "",
        value: opt.value ?? "",
      })),
    })),
  };

  return <EditForm form={sanitizedForm} />;
};

export default EditFormPage;
