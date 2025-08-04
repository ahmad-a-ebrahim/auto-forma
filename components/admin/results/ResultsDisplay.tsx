import React from "react";
import { ResultsTable } from "./ResultsTable";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { forms } from "@/db/schema";
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
