"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form as FormComponent,
  FormField as ShadCnFormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import FormField from "../../../components/forms/FormField";
import { createForm } from "@/app/actions/createForm";
import type {
  QuestionSelectModel,
  FieldOptionSelectModel,
} from "@/types/form-types";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "@/utils/validation";
import { useToast } from "@/hooks/use-toast";

interface QuestionWithOptions extends QuestionSelectModel {
  fieldOptions: FieldOptionSelectModel[];
}

const CreateFormPage: React.FC = () => {
  const { toast } = useToast();
  const router = useRouter();

  const defaultValues: {
    name: string;
    description: string;
    questions: QuestionWithOptions[];
  } = {
    name: "",
    description: "",
    questions: [],
  };

  const formHook = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const name: string = formHook.watch("name");
  const description: string = formHook.watch("description");
  const questions: QuestionWithOptions[] = formHook.watch("questions");

  const [isLoading, setIsLoading] = useState(false);

  const addQuestion = () => {
    const newQuestion: QuestionWithOptions = {
      id: Date.now(),
      text: "",
      fieldType: "Input",
      fieldOptions: [],
      formId: null,
      required: false,
      order: questions.length,
    };
    formHook.setValue("questions", [...questions, newQuestion]);
  };

  const deleteQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    formHook.setValue("questions", updated);
    formHook.trigger();
  };

  const onSubmit = async (data: any) => {
    const cleanedQuestions = questions.map((q) => ({
      id: q.id,
      text: q.text ?? "",
      fieldType: q.fieldType ?? "Input",
      fieldOptions: q.fieldOptions.map((opt) => ({
        text: opt.text ?? "",
        value: opt.value ?? "",
      })),
      required: q.required,
      order: q.order,
    }));

    try {
      setIsLoading(true);

      const res = await createForm({
        name,
        description,
        questions: cleanedQuestions,
      });

      if (res.success) {
        toast({
          variant: "success",
          title: "Success",
          description: "Form created",
        });
        router.push("/view-forms");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res?.error || "Form creation failed",
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
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-1 left-1 sm:top-10 sm:left-10"
        onClick={() => router.push("/view-forms")}
      >
        <ArrowLeft />
      </Button>

      <FormComponent {...formHook}>
        <form
          onSubmit={formHook.handleSubmit(onSubmit)}
          className="my-4 text-left"
        >
          <ShadCnFormField
            control={formHook.control}
            name={`name`}
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormControl>
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    className="text-lg font-bold py-3 bg-transparent outline-none border-b w-full"
                    placeholder="Form Name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ShadCnFormField
            control={formHook.control}
            name={`description`}
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormControl>
                  <Textarea
                    value={field.value}
                    onChange={field.onChange}
                    className="text-md bg-transparent outline-none border-b w-full"
                    placeholder="Form Description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DragDropContext
            onDragStart={() => {
              formHook.clearErrors();
            }}
            onDragEnd={(result: DropResult) => {
              if (!result.destination) return;

              const updated = Array.from(questions);
              const [moved] = updated.splice(result.source.index, 1);
              updated.splice(result.destination.index, 0, moved);

              const reordered = updated.map((q, idx) => ({
                ...q,
                order: idx,
              }));

              formHook.setValue("questions", reordered);
              formHook.trigger();
            }}
          >
            <Droppable droppableId="questions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {questions.map((question, index) => (
                    <Draggable
                      key={question.id}
                      draggableId={question.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="relative bg-accent p-6 rounded-md pt-12 mb-4"
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            type="button"
                            onClick={() => deleteQuestion(index)}
                            className="absolute top-0 right-0 text-red-500 hover:text-red-500 hover:bg-red-100"
                          >
                            <X size={16} />
                          </Button>

                          <ShadCnFormField
                            control={formHook.control}
                            name={`questions.${index}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <FormField
                                    id={field.name}
                                    element={question}
                                    value={String(index)}
                                    onChange={(val) => {
                                      const updated = [...questions];
                                      updated[index] = val;
                                      formHook.setValue("questions", updated);
                                    }}
                                    editMode={true}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <div className="flex justify-start items-center gap-4 pt-4">
                            <Label htmlFor={`question_${question.id}`}>
                              Required
                            </Label>
                            <Switch
                              id={`question_${question.id}`}
                              checked={question.required}
                              onCheckedChange={(checked: boolean) => {
                                const updatedQuestions = questions.map((q) => {
                                  if (q.id === question.id)
                                    return { ...q, required: checked };
                                  return q;
                                });

                                formHook.setValue("questions", [
                                  ...updatedQuestions,
                                ]);
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {(formHook.formState.errors.questions?.message ||
            formHook.formState.errors.questions?.root?.message) && (
            <p className="flex items-center gap-2 text-sm font-medium text-destructive mb-4">
              <Info size={16} />
              {formHook.formState.errors.questions?.message ||
                formHook.formState.errors.questions?.root?.message}
            </p>
          )}

          <div className="bg-accent p-6 rounded-md mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={addQuestion}
              className="max-w-fit"
            >
              <Plus className="mr-2" /> Add Question
            </Button>
          </div>

          <Button
            disabled={isLoading}
            type="submit"
            variant="default"
            className="w-full"
          >
            Create
          </Button>
        </form>
      </FormComponent>
    </div>
  );
};

export default CreateFormPage;
