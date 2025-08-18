import { InferSelectModel } from "drizzle-orm";
import { forms, questions, fieldOptions, users } from "@/db/schema";

export type FormSelectModel = InferSelectModel<typeof forms>;
export type QuestionSelectModel = InferSelectModel<typeof questions>;
export type FieldOptionSelectModel = InferSelectModel<typeof fieldOptions>;
export type UserType = InferSelectModel<typeof users>;

export type FieldType =
  | "RadioGroup"
  | "Select"
  | "Input"
  | "Textarea"
  | "Switch"
  | "Email"
  | "Number"
  | "Date"
  | "Phone";
