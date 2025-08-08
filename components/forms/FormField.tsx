"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FormField as ShadCnFormField,
  FormControl,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  QuestionSelectModel,
  FieldOptionSelectModel,
} from "@/types/form-types";
import { Minus, Plus } from "lucide-react";
import { useFormContext } from "react-hook-form";
import DatePicker from "../ui/date-picker";
import { PhoneInput } from "../ui/phone-input";

type Props = {
  element: QuestionSelectModel & { fieldOptions: FieldOptionSelectModel[] };
  value: string | Date;
  onChange: (val: any) => void;
  id: string;
  editMode?: boolean;
};

const FormField: React.FC<Props> = ({
  element,
  value,
  onChange,
  id,
  editMode,
}) => {
  const formHook = useFormContext();

  if (!element) return null;

  if (editMode) {
    // updateOption handler for modifying existing options
    const updateOption = (idx: number, key: "text" | "value", val: string) => {
      const opts = [...element.fieldOptions];
      opts[idx] = { ...opts[idx], [key]: val };
      onChange({ ...element, fieldOptions: opts });
    };

    // Add Option handler
    const addOption = () =>
      onChange({
        ...element,
        fieldOptions: [
          ...element.fieldOptions,
          { id: Date.now(), text: "", value: "" },
        ],
      });

    // Delete Option handler
    const deleteOption = (idx: number) => {
      const opts = [...element.fieldOptions];
      opts.splice(idx, 1);
      onChange({ ...element, fieldOptions: opts });
    };
    // value here is question index (Edit Mode)
    return (
      <div className="space-y-2">
        <ShadCnFormField
          control={formHook.control}
          name={`questions.${value}.text`}
          render={() => (
            <FormItem className="mb-4">
              <FormControl>
                <Input
                  value={element.text as string}
                  onChange={(e) =>
                    onChange({ ...element, text: e.target.value })
                  }
                  placeholder="Question text"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ShadCnFormField
          control={formHook.control}
          name={`questions.${value}.fieldType`}
          render={() => (
            <FormItem className="mb-4">
              <FormControl>
                <Select
                  value={element.fieldType as string}
                  onValueChange={(val) =>
                    onChange({ ...element, fieldType: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Input",
                      "Textarea",
                      "Switch",
                      "Select",
                      "RadioGroup",
                      "Email",
                      "Number",
                      "Date",
                      "Phone",
                    ].map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {(element.fieldType === "Select" ||
          element.fieldType === "RadioGroup") && (
          <div className="space-y-2">
            {element.fieldOptions.map((opt, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <ShadCnFormField
                  control={formHook.control}
                  name={`questions.${value}.fieldOptions.${idx}.text`}
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <Input
                          value={opt.text as string}
                          onChange={(e) =>
                            updateOption(idx, "text", e.target.value)
                          }
                          placeholder="Option Text"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <ShadCnFormField
                  control={formHook.control}
                  name={`questions.${value}.fieldOptions.${idx}.value`}
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <Input
                          value={opt.value as string}
                          onChange={(e) =>
                            updateOption(idx, "value", e.target.value)
                          }
                          placeholder="Option Value"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Delete Option button */}
                <Button
                  size={"icon"}
                  type="button"
                  variant="ghost"
                  className="shrink-0 text-red-500 hover:text-red-500 hover:bg-red-100"
                  onClick={() => deleteOption(idx)}
                >
                  <Minus size={16} />
                </Button>
              </div>
            ))}
            {/* Add Option button */}
            <Button type="button" variant="outline" onClick={addOption}>
              <Plus /> Add Option
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Non-edit mode: render the appropriate input
  const components = {
    Input: () => (
      <Input
        id={id}
        type="text"
        value={value as string}
        onChange={(e) => onChange(String(e.target.value))}
      />
    ),
    Switch: () => (
      <Switch
        id={id}
        value={value === "Yes" ? 1 : 0}
        onCheckedChange={(checked) => onChange(checked ? "Yes" : "No")}
      />
    ),
    Textarea: () => (
      <Textarea
        id={id}
        value={value as string}
        onChange={(e) => onChange(String(e.target.value))}
      />
    ),
    Select: () => (
      <Select defaultValue={value as string} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue
            defaultValue={value as string}
            placeholder="Select option"
          />
        </SelectTrigger>
        <SelectContent>
          {element.fieldOptions.map((option) => (
            <SelectItem key={option.id} value={`answerId_${option.id}`}>
              {option.text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
    RadioGroup: () => (
      <RadioGroup defaultValue={value as string} onValueChange={onChange}>
        {element.fieldOptions.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <FormControl>
              <RadioGroupItem
                value={`answerId_${option.id}`}
                id={`answerId_${option.id}`}
              />
            </FormControl>
            <Label htmlFor={`answerId_${option.id}`}>{option.text}</Label>
          </div>
        ))}
      </RadioGroup>
    ),
    Email: () => (
      <Input
        id={id}
        type="text"
        value={value as string}
        onChange={(e) => onChange(String(e.target.value))}
      />
    ),
    Number: () => (
      <Input
        id={id}
        type="number"
        value={value as string}
        onChange={(e) => onChange(String(e.target.value))}
      />
    ),
    Date: () => (
      <DatePicker
        id={id}
        value={value as Date}
        onChange={onChange}
        className="w-full"
      />
    ),
    Phone: () => (
      <PhoneInput id={id} value={value as string} onChange={onChange} />
    ),
  };

  return element.fieldType && components[element.fieldType]
    ? components[element.fieldType]()
    : null;
};

export default FormField;
