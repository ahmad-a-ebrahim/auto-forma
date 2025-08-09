import React from "react";
import FormsList from "@/components/forms/FormsList";
import { getUserForms } from "@/app/actions/getUserForms";
import { InferSelectModel } from "drizzle-orm";
import { forms as dbForms } from "@/db/schema";

const ViewFormsPage = async () => {
  const forms: InferSelectModel<typeof dbForms>[] = await getUserForms();

  return <FormsList forms={forms} />;
};

export default ViewFormsPage;
