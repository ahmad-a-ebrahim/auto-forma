"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form as FormComponent,
  FormField as ShadCnFormField,
  FormItem,
  FormControl,
} from "@/components/ui/form";
import FormField from "../../../components/forms/FormField";
import { createForm } from "@/app/actions/createForm";

import type {
  QuestionSelectModel,
  FieldOptionSelectModel,
} from "@/types/form-types";
import { useSession } from "next-auth/react";

interface QuestionWithOptions extends QuestionSelectModel {
  fieldOptions: FieldOptionSelectModel[];
}

const CreateFormPage: React.FC = () => {
  const session = useSession();
  const userId = session.data?.user?.id;

  const formHook = useForm();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addQuestion = () => {
    const newQuestion: QuestionWithOptions = {
      id: Date.now(),
      text: "",
      fieldType: "Input",
      fieldOptions: [],
      formId: null,
      required: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const deleteQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleCreateForm = async () => {
    const cleanedQuestions = questions.map((q) => ({
      id: q.id,
      text: q.text ?? "",
      fieldType: q.fieldType ?? "Input",
      fieldOptions: q.fieldOptions.map((opt) => ({
        text: opt.text ?? "",
        value: opt.value ?? "",
      })),
    }));

    try {
      setIsLoading(true);
      const result = await createForm({
        userId: userId ?? "",
        name,
        description,
        questions: cleanedQuestions,
      });
      if (result?.id) {
        router.push(`/forms/edit/${result.id}`);
      } else {
        alert("Creation failed!");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating form");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center">
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-1 left-1 sm:top-10 sm:left-10"
        onClick={() => router.back()}
      >
        <ArrowLeft />
      </Button>

      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Form Name"
        className="text-lg font-bold py-3 bg-transparent outline-none border-b w-full mb-4"
      />

      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Form Description"
        className="text-md bg-transparent outline-none border-b w-full"
      />

      <FormComponent {...formHook}>
        <div className="my-4 flex flex-col gap-6 text-left sm:min-w-96">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="relative bg-accent p-6 rounded-md pt-12"
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
                name={`question_${question.id}`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FormField
                        id={`question_${question.id}`}
                        element={question}
                        value={field.value}
                        onChange={(val) => {
                          const updated = [...questions];
                          updated[index] = val;
                          setQuestions(updated);
                        }}
                        editMode={true}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          ))}

          <div className="bg-accent p-6 rounded-md">
            <Button
              type="button"
              variant="outline"
              onClick={addQuestion}
              className="max-w-fit"
            >
              <Plus size={16} className="mr-2" /> Add Question
            </Button>
          </div>

          <div className="bg-accent p-6 rounded-md">
            <Button
              disabled={isLoading}
              type="button"
              variant="outline"
              onClick={handleCreateForm}
              className="w-full"
            >
              Save
            </Button>
          </div>
        </div>
      </FormComponent>
    </div>
  );
};

export default CreateFormPage;
