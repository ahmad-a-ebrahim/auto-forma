import React from "react";
import FormsList from "@/components/forms/FormsList";
import { getUserForms } from "@/app/actions/getUserForms";
import { InferSelectModel } from "drizzle-orm";
import { forms as dbForms } from "@/db/schema";
import { SessionProvider } from "next-auth/react";

const ViewFormsPage = async () => {
  const forms: InferSelectModel<typeof dbForms>[] = await getUserForms();

  return (
    <SessionProvider>
      <FormsList forms={forms} />
    </SessionProvider>
  );
};

export default ViewFormsPage;
