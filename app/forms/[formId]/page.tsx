import React from "react";
import { db } from "@/db";
import { forms } from "@/db/schema";
import { eq } from "drizzle-orm";
import Form from "@/components/forms/Form";
import MessageUI from "@/components/MessageUI";
import notFound from "@/public/not-found.svg";

const SubmitFormPage = async ({
  params,
}: {
  params: {
    formId: string;
  };
}) => {
  const formId = params.formId;

  if (!formId) {
    return <MessageUI image={notFound} message="Form not found." />;
  }

  const form = await db.query.forms.findFirst({
    where: eq(forms.id, parseInt(formId)),
    with: {
      questions: {
        with: {
          fieldOptions: true,
        },
      },
    },
  });

  if (!form || !form.published) {
    return <MessageUI image={notFound} message="Form not found." />;
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
        id: opt.id ?? 0,
        questionId: opt.questionId ?? 0,
        text: opt.text ?? "",
        value: opt.value ?? "",
      })),
    })),
  };

  return <Form form={sanitizedForm} />;
};

export default SubmitFormPage;
