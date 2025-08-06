import z from "zod";

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
