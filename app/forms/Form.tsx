"use client";
import React, { useState } from 'react'
import { FormSelectModel, QuestionSelectModel, FieldOptionSelectModel } from '@/types/form-types'
import { Form as FormComponent, FormField as ShadCnFormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from '@/components/ui/button';
import FormField from './FormField';
import { publishForm } from '../actions/mutateForm';
import FormPublishSuccess from './FormPublishSuccess';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type Props = {
  form: Form,
  editMode?: boolean
}

type QuestionWithOptionsModel = QuestionSelectModel & {
  fieldOptions: Array<FieldOptionSelectModel>
}

interface Form extends FormSelectModel {
  questions: Array<QuestionWithOptionsModel>
}

const Form = (props: Props) => {
  const form = useForm();
  const router = useRouter();
  const { editMode } = props;
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const handleDialogChange = (open: boolean) => {
    setSuccessDialogOpen(open);
  }

  const onSubmit = async (data: any) => {
    if (editMode) {
      await publishForm(props.form.id);
      setSuccessDialogOpen(true);
    } else {
      let answers = [];
      for (const [questionId, value] of Object.entries(data)) {
        const id = parseInt(questionId.replace('question_', ''));
        let fieldOptionsId = null;
        let textValue = null;

        if (typeof value == "string" && value.includes('answerId_')) {
          fieldOptionsId = parseInt(value.replace('answerId_', ''));
        } else {
          textValue = value as string;
        }

        answers.push({
          questionId: id,
          fieldOptionsId,
          value: textValue
        })
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/form/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ formId: props.form.id, answers })
      });
      if (response.status === 200) {
        router.push(`/forms/${props.form.id}/success`);
      } else {
        console.error('Error submitting form');
        alert('Error submitting form. Please try again later');
      }
    }
  }

  return (
    <div className='text-center'>
      <h1 className='text-lg font-bold py-3'>{props.form.name}</h1>
      <h3 className='text-md'>{props.form.description}</h3>
      <FormComponent {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='my-4 flex flex-col gap-6 text-left'>
          {props.form.questions.map((question: QuestionWithOptionsModel, index: number) => {
            return (
              <ShadCnFormField
                control={form.control}
                name={`question_${question.id}`}
                key={`${question.text}_${index}`}
                render={({ field }) => (
                  <FormItem className={cn(question.fieldType === "Switch" && "flex items-center gap-2 sm:gap-6")}>
                    <FormLabel htmlFor={`question_${question.id}`} className='text-base mt-3'>{index + 1}.{" "}{question.text}</FormLabel>
                    <FormControl>
                      <FormField id={`question_${question.id}`} element={question} key={index} value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )
          })}
          {editMode && !props.form.published && (
            <Button type='submit'>Publish</Button>
          )}
          {!editMode && (
            <Button type='submit'>Submit</Button>
          )}
        </form>
      </FormComponent>
      <FormPublishSuccess formId={props.form.id} open={successDialogOpen} onOpenChange={handleDialogChange} />
    </div>
  )
}

export default Form
