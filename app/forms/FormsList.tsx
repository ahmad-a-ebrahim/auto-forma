import React from 'react'
import { forms } from '@/db/schema';
import { InferSelectModel } from 'drizzle-orm';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Form = InferSelectModel<typeof forms>;

type Props = {
  forms: Form[]
}

const FormsList = (props: Props) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-2 sm:p-4 gap-4'>
      {props.forms.map((form: Form) => (
        <Card key={form.id} className='flex flex-col justify-between'>
          <CardHeader>
            <CardTitle>
              {form.name}
            </CardTitle>
            <CardDescription>
              {form.description}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link className="w-full" href={`/forms/edit/${form.id}`}>
              <Button className='w-full' size="sm">View</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default FormsList
