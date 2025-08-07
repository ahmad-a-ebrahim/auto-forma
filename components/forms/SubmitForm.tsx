"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import FormField from "./FormField";
import {
  Form as FormComponent,
  FormField as ShadCnFormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  QuestionSelectModel,
  FieldOptionSelectModel,
} from "@/types/form-types";
import { ArrowLeft } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useToast } from "@/hooks/use-toast";
import { submitForm } from "@/app/actions/submitForm";

interface QuestionWithOptions extends QuestionSelectModel {
  fieldOptions: FieldOptionSelectModel[];
}

type Props = {
  form: {
    id: number;
    name: string;
    description: string;
    published: boolean;
    questions: QuestionWithOptions[];
  };
  previewMode?: boolean;
};

const SubmitForm: React.FC<Props> = ({ form, previewMode = false }) => {
  const { toast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const schema = useMemo(() => {
    const questions = form?.questions || [];
    let validationObj: any = {};

    questions.forEach((q) => {
      if (q.fieldType === "Switch") {
        validationObj[`question_${q.id}`] = z.any();
      } else {
        if (q.required) {
          validationObj[`question_${q.id}`] = z
            .string({
              required_error: "Required",
              message: "Required",
            })
            .min(1, { message: "Required" });
        } else {
          validationObj[`question_${q.id}`] = z.string().optional();
        }
      }
    });

    return z.object(validationObj);
  }, [form.questions]);

  const formHook = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    if (previewMode) {
      toast({
        variant: "success",
        title: "Success",
        description: "On Preview Mode",
      });
      return;
    }

    try {
      setIsLoading(true);
      let answers = [];
      for (const [questionId, value] of Object.entries(data)) {
        const id = parseInt(questionId.replace("question_", ""));
        let fieldOptionsId = null;
        let textValue = null;

        if (typeof value === "string" && value.includes("answerId_")) {
          fieldOptionsId = parseInt(value.replace("answerId_", ""));
        } else {
          textValue = value as string;
        }

        answers.push({ questionId: id, fieldOptionsId, value: textValue });
      }

      const res = await submitForm({
        formId: form.id,
        answers,
      });

      if (res.success) {
        router.push(`/forms/${form.id}/success`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res?.error || "Submit failed",
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center min-w-[90dvw] sm:min-w-96">
      {previewMode && (
        <Button
          size="icon"
          variant={"ghost"}
          className="absolute top-1 left-1 sm:top-10 sm:left-10"
          onClick={() => router.push("/view-forms")}
        >
          <ArrowLeft />
        </Button>
      )}

      <h1 className="text-lg font-bold py-3">{form?.name || ""}</h1>

      <h3 className="text-md">{form?.description || ""}</h3>

      <FormComponent {...formHook}>
        <form
          onSubmit={formHook.handleSubmit(onSubmit)}
          className="my-4 text-left"
        >
          {form.questions.map((question, index) => (
            <div
              key={question.id}
              className={cn("relative bg-accent p-6 rounded-md mb-4")}
            >
              <ShadCnFormField
                control={formHook.control}
                name={`question_${question.id}`}
                render={({ field }) => (
                  <FormItem
                    className={cn(
                      question.fieldType === "Switch" &&
                        "flex justify-between items-center gap-1"
                    )}
                  >
                    <FormLabel
                      htmlFor={field.name}
                      className="text-base"
                      required={question.required}
                    >
                      {index + 1}. {question.text}
                    </FormLabel>
                    <FormControl>
                      <FormField
                        id={field.name}
                        element={question}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}

          <Button disabled={isLoading} type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </FormComponent>
    </div>
  );
};

export default SubmitForm;
