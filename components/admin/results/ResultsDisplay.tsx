import React from "react";
import { ResultsTable } from "./ResultsTable";
import { db } from "@/db";
import { asc, eq } from "drizzle-orm";
import { forms, questions } from "@/db/schema";
import MessageUI from "@/components/MessageUI";
import notFound from "@/public/not-found.svg";
import noData from "@/public/no-data.svg";

type Props = {
  formId: number;
};

const ResultsDisplay = async ({ formId }: Props) => {
  const form = await db.query.forms.findFirst({
    where: eq(forms.id, formId),
    with: {
      questions: {
        with: {
          fieldOptions: true,
        },
        orderBy: asc(questions.order),
      },
      submissions: {
        with: {
          answers: {
            with: {
              fieldOption: true,
            },
          },
        },
      },
    },
  });

  if (!form || !form.published)
    return (
      <MessageUI
        image={notFound}
        message="This form is not found."
        disableBtn
      />
    );

  if (!form.submissions.length)
    return (
      <MessageUI
        image={noData}
        message="No submissions on this form yet!"
        disableBtn
      />
    );

  return (
    <div>
      <ResultsTable data={form.submissions} columns={form.questions} />
    </div>
  );
};

export default ResultsDisplay;
