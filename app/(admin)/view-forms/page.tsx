import React from 'react'
import FormsList from '@/app/forms/FormsList'
import { getUserForms } from '@/app/actions/getUserForms'
import { InferSelectModel } from 'drizzle-orm'
import { forms as dbForms } from "@/db/schema";
import { SessionProvider } from 'next-auth/react';

type Props = {}

const page = async (props: Props) => {
  const forms: InferSelectModel<typeof dbForms>[] = await getUserForms();

  return (
    <SessionProvider>
      <FormsList forms={forms} />
    </SessionProvider>
  )
}

export default page
