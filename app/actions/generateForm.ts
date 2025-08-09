"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { saveForm } from "./mutateForm";
import { auth } from "@/auth";

function extractJSON(text: string): string {
  const jsonPattern = /{[^]*}/;
  const match = text.match(jsonPattern);

  return match ? match[0].trim() : "";
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateForm(
  prevState: {
    message: string;
  },
  formData: FormData
) {
  const schema = z.object({
    description: z.string().min(1),
  });
  const parse = schema.safeParse({
    description: formData.get("description"),
  });

  if (!parse.success) {
    return {
      message: "Failed to parse data",
    };
  }

  if (!process.env.GEMINI_API_KEY) {
    return {
      message: "No GEMINI API key found",
    };
  }

  const data = parse.data;
  const promptExplanation =
    "Based on the description, generate a survey object with 3 fields: name(string) for the form, description(string) of the form and a questions array where every element has 2 fields: text and the fieldType and fieldType can be of these options RadioGroup, Select, Input, Textarea, Switch, Email, Number, Date, Phone; and return it in json format. For RadioGroup, and Select types also return fieldOptions array with text and value fields. For example, for RadioGroup, and Select types, the field options array can be [{text: 'Yes', value: 'yes'}, {text: 'No', value: 'no'}] and for Input, Textarea, and Switch types, the field options array can be empty. For example, for Input, Textarea, and Switch types, the field options array can be []";

  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return {
        message: "Unauthorized",
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${data.description} ${promptExplanation}`,
    });

    const responseJSON = extractJSON(response.text ?? "");

    const responseObj = JSON.parse(responseJSON);

    const res = await saveForm({
      name: responseObj.name,
      description: responseObj.description,
      questions: responseObj.questions,
    });

    if (res.success) {
      revalidatePath("/");
      return {
        message: "success",
        data: { formId: res.formId },
      };
    } else {
      return {
        message: res?.error || "Failed to save form",
      };
    }
  } catch (err) {
    console.error(err);

    return {
      message: "Failed to create form",
    };
  }
}
