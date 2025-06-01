'use client';
import React, { useState } from 'react';
import {
  Form as FormComponent,
  FormField as ShadCnFormField,
  FormItem,
  FormLabel,
  FormControl
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from '@/components/ui/button';
import FormField from './FormField';
import { publishForm } from '../actions/mutateForm';
import { updateFormQuestions } from '../actions/updateFormQuestions';
import FormPublishSuccess from './FormPublishSuccess';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FormSelectModel, QuestionSelectModel, FieldOptionSelectModel } from '@/types/form-types';

type Props = {
  form: {
    id: number;
    name: string;
    description: string;
    published: boolean;
    questions: (QuestionSelectModel & {
      fieldOptions: FieldOptionSelectModel[];
    })[];
  },
  editMode?: boolean
};

const Form = ({ form: initialForm, editMode }: Props) => {
  const form = useForm();
  const router = useRouter();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [questions, setQuestions] = useState(initialForm.questions);
  const [isSaving, setIsSaving] = useState(false);

  const handleDialogChange = (open: boolean) => {
    setSuccessDialogOpen(open);
  };

  const onSubmit = async (data: any) => {
    if (editMode) {
      await publishForm(initialForm.id);
      setSuccessDialogOpen(true);
    } else {
      let answers = [];
      for (const [questionId, value] of Object.entries(data)) {
        const id = parseInt(questionId.replace('question_', ''));
        let fieldOptionsId = null;
        let textValue = null;

        if (typeof value === "string" && value.includes('answerId_')) {
          fieldOptionsId = parseInt(value.replace('answerId_', ''));
        } else {
          textValue = value as string;
        }

        answers.push({ questionId: id, fieldOptionsId, value: textValue });
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/form/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: initialForm.id, answers })
      });

      if (response.status === 200) {
        router.push(`/forms/${initialForm.id}/success`);
      } else {
        alert('Error submitting form. Please try again later');
      }
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    await updateFormQuestions({
      formId: initialForm.id,
      questions: questions.map(q => ({
        id: q.id,
        text: q.text,
        fieldType: q.fieldType,
        fieldOptions: q.fieldOptions,
      }))
    });
    setIsSaving(false);
    alert('Form changes saved!');
  };

  return (
    <div className='text-center'>
      <h1 className='text-lg font-bold py-3'>{initialForm.name}</h1>
      <h3 className='text-md'>{initialForm.description}</h3>
      <FormComponent {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='my-4 flex flex-col gap-6 text-left'>
          {questions.map((question, index) => (
            <ShadCnFormField
              control={form.control}
              name={`question_${question.id}`}
              key={question.id}
              render={({ field }) => (
                <FormItem className={cn(question.fieldType === "Switch" && "flex items-center gap-2 sm:gap-6")}>
                  {!editMode && (
                    <FormLabel htmlFor={`question_${question.id}`} className='text-base mt-3'>
                      {index + 1}.{" "}{question.text}
                    </FormLabel>
                  )}
                  <FormControl>
                    <FormField
                      id={`question_${question.id}`}
                      element={question}
                      value={field.value}
                      onChange={(updated) => {
                        if (editMode) {
                          const updatedQuestions = [...questions];
                          updatedQuestions[index] = updated;
                          setQuestions(updatedQuestions);
                        } else {
                          field.onChange(updated);
                        }
                      }}
                      editMode={editMode}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
          {editMode && !initialForm.published && (
            <Button type='submit'>Publish</Button>
          )}
          {editMode && (
            <Button disabled={isSaving} type='button' onClick={handleSaveChanges} variant="secondary">
              {isSaving ? "Saving...": "Save Changes"}
            </Button>
          )}
          {!editMode && (
            <Button type='submit'>Submit</Button>
          )}
        </form>
      </FormComponent>
      <FormPublishSuccess formId={initialForm.id} open={successDialogOpen} onOpenChange={handleDialogChange} />
    </div>
  );
};

export default Form;
