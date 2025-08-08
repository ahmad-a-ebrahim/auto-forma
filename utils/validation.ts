import { validatePhone } from "@/lib/utils";
import {
  FieldOptionSelectModel,
  QuestionSelectModel,
} from "@/types/form-types";
import z from "zod";

interface QuestionWithOptions extends QuestionSelectModel {
  fieldOptions: FieldOptionSelectModel[];
}

export const formSchema = z.object({
  name: z.string().min(1, { message: "Form name is required" }),
  description: z.string().min(1, { message: "Form description is required" }),
  questions: z
    .array(
      z.object({
        id: z.number(),
        text: z.string().min(1, { message: "Question text is required" }),
        fieldType: z.enum([
          "Input",
          "Switch",
          "Textarea",
          "Select",
          "RadioGroup",
          "Email",
          "Number",
          "Date",
          "Phone",
        ]),
        formId: z.number().nullable(),
        required: z.boolean(),
        order: z.number(),
        fieldOptions: z.array(
          z.object({
            text: z.string().min(1, { message: "Option text is required" }),
            value: z.string().min(1, { message: "Option value is required" }),
          })
        ),
      })
    )
    .min(1, { message: "At least one question is required" }),
});

export const generateDynamicSchema = (questions: QuestionWithOptions[]) => {
  const validationObj: Record<string, any> = {};

  questions.forEach((q) => {
    const key = `question_${q.id}`;
    switch (q.fieldType) {
      case "Date":
        validationObj[key] = q.required
          ? z.date()
          : z.union([z.date(), z.string().length(0)]).optional();
        break;

      case "Email":
        validationObj[key] = q.required
          ? z
              .string()
              .email({ message: "Invalid email" })
              .min(1, { message: "Required" })
          : z
              .union([
                z.string().email({ message: "Invalid email" }),
                z.literal(""),
              ])
              .optional();
        break;

      case "Input":
      case "Textarea":
        validationObj[key] = q.required
          ? z.string().min(1, { message: "Required" })
          : z.string().optional();
        break;

      case "Number":
        validationObj[key] = q.required
          ? z
              .string()
              .refine((val) => val.trim() !== "", { message: "Required" })
              .refine((val) => !isNaN(Number(val)), {
                message: "Must be a number",
              })
              .transform((val) => Number(val))
          : z
              .string()
              .optional()
              .refine((val) => !val || !isNaN(Number(val)), {
                message: "Must be a number",
              })
              .transform((val) => (val ? Number(val) : undefined));
        break;

      case "Phone":
        validationObj[key] = z.any().refine(
          (value) => {
            if (!q.required && !value) return true;
            return validatePhone(value as string);
          },
          { message: "Invalid phone" }
        );
        break;

      case "RadioGroup":
      case "Select":
        validationObj[key] = q.required
          ? z.string().min(1, { message: "Required" })
          : z.string().optional();
        break;

      case "Switch":
        validationObj[key] = z.any().default("No");
        break;

      default:
        break;
    }
  });

  return z.object(validationObj);
};
