"use client";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { publishForm } from "@/app/actions/mutateForm";
import { updateFormQuestions } from "@/app/actions/updateFormQuestions";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  QuestionSelectModel,
  FieldOptionSelectModel,
} from "@/types/form-types";
import { ArrowLeft, Plus, Send, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import MessageUI from "../MessageUI";
import lightPulp from "@/public/light-pulp.svg";

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
  editMode?: boolean;
  previewMode?: boolean;
};

const Form: React.FC<Props> = ({
  form: initialForm,
  editMode,
  previewMode,
}) => {
  const router = useRouter();

  // States
  const [name, setName] = useState(initialForm.name);
  const [description, setDescription] = useState(initialForm.description);
  const [questions, setQuestions] = useState<QuestionWithOptions[]>(
    initialForm.questions
  );
  const [isLoading, setIsLoading] = useState(false);

  const schema = useMemo(() => {
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
  }, [questions]);

  const formHook = useForm({
    resolver: zodResolver(editMode || previewMode ? z.any() : schema),
  });

  // Add Question
  const addQuestion = () => {
    const newQuestion: QuestionWithOptions = {
      id: Date.now(),
      text: "",
      fieldType: "Input",
      fieldOptions: [],
      formId: initialForm.id,
      required: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  // Delete Question
  const deleteQuestion = (idx: number) => {
    const updated = [...questions];
    updated.splice(idx, 1);
    setQuestions(updated);
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      await updateFormQuestions({
        formId: initialForm.id,
        name,
        description,
        questions: questions.map((q) => ({
          id: q.id,
          text: q.text ?? "",
          fieldType: q.fieldType ?? "Input",
          fieldOptions: q.fieldOptions.map((opt) => ({
            text: opt.text ?? "",
            value: opt.value ?? "",
          })),
          required: q.required,
        })),
      });
      alert("Form changes saved!");
    } catch (err) {
      console.error(err);
      alert("Saving failed!");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (editMode) {
      try {
        setIsLoading(true);
        await publishForm(initialForm.id);
        router.push("/view-forms");
      } catch (err) {
        console.error(err);
        alert("Publishing failed. Try again!");
      } finally {
        setIsLoading(false);
      }
    } else {
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

        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const response = await fetch(`${baseUrl}/api/form/new`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formId: initialForm.id, answers }),
        });

        if (response.status === 200) {
          router.push(`/forms/${initialForm.id}/success`);
        } else {
          alert("Error submitting form. Please try again later");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (initialForm.published && editMode)
    return (
      <MessageUI
        image={lightPulp}
        message="This form is published, you can not modify it."
      />
    );

  return (
    <div className="text-center sm:min-w-96">
      {(editMode || previewMode) && (
        <Button
          size="icon"
          variant={"ghost"}
          className="absolute top-1 left-1 sm:top-10 sm:left-10"
          onClick={() => router.push("/view-forms")}
        >
          <ArrowLeft />
        </Button>
      )}

      {editMode ? (
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-lg font-bold py-3 bg-transparent outline-none border-b w-full mb-4"
          placeholder="Form Name"
        />
      ) : (
        <h1 className="text-lg font-bold py-3">{name}</h1>
      )}

      {editMode ? (
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="text-md bg-transparent outline-none border-b w-full"
          placeholder="Form Description"
        />
      ) : (
        <h3 className="text-md">{description}</h3>
      )}

      <FormComponent {...formHook}>
        <form
          onSubmit={formHook.handleSubmit(onSubmit)}
          className="my-4 flex flex-col gap-6 text-left"
        >
          {questions.map((question, index) => (
            <div
              key={question.id}
              className={cn(
                "relative bg-accent p-6 rounded-md",
                editMode && "pt-12"
              )}
            >
              {editMode && (
                <Button
                  size={"icon"}
                  variant={"ghost"}
                  type="button"
                  onClick={() => deleteQuestion(index)}
                  className="absolute top-0 right-0 text-red-500 hover:text-red-500 hover:bg-red-100"
                >
                  <X size={16} />
                </Button>
              )}
              <ShadCnFormField
                control={formHook.control}
                name={`question_${question.id}`}
                render={({ field }) => (
                  <FormItem
                    className={cn(
                      question.fieldType === "Switch" &&
                        !editMode &&
                        "flex justify-between items-center gap-2"
                    )}
                  >
                    {!editMode && (
                      <FormLabel
                        htmlFor={field.name}
                        className="text-base mt-3"
                        required={question.required}
                      >
                        {index + 1}. {question.text}
                      </FormLabel>
                    )}
                    <FormControl>
                      <FormField
                        id={field.name}
                        element={question}
                        value={field.value}
                        onChange={(val) => {
                          if (editMode) {
                            const updated = [...questions];
                            updated[index] = val;
                            setQuestions(updated);
                          } else {
                            field.onChange(val);
                          }
                        }}
                        editMode={editMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {editMode && (
                <div className="flex justify-start items-center gap-4 pt-4">
                  <Label htmlFor={`question_${question.id}`}>Required</Label>
                  <Switch
                    id={`question_${question.id}`}
                    checked={question.required}
                    onCheckedChange={(checked: boolean) => {
                      const updatedQuestions = questions.map((q) => {
                        if (q.id === question.id)
                          return { ...q, required: checked };
                        return q;
                      });

                      setQuestions([...updatedQuestions]);
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          {editMode && (
            <div className="bg-accent p-6 rounded-md">
              <Button
                type="button"
                variant="outline"
                onClick={addQuestion}
                className="max-w-fit"
              >
                <Plus className="mr-2" /> Add Question
              </Button>
            </div>
          )}

          {editMode && (
            <div className="bg-accent p-6 rounded-md">
              <Button
                disabled={isLoading}
                type="button"
                variant="outline"
                onClick={handleSaveChanges}
                className="w-full"
              >
                Save
              </Button>
            </div>
          )}

          {!editMode && !previewMode && (
            <Button disabled={isLoading} type="submit">
              Submit
            </Button>
          )}

          {editMode && !initialForm.published && (
            <Button
              disabled={isLoading}
              variant={"default"}
              type="submit"
              size={"lg"}
              className="fixed bottom-1 right-1 sm:bottom-10 sm:right-10 flex gap-2.5"
            >
              <Send />
              Publish
            </Button>
          )}
        </form>
      </FormComponent>
    </div>
  );
};

export default Form;
