'use client';

import React, { ChangeEvent } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { QuestionSelectModel, FieldOptionSelectModel } from '@/types/form-types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type Props = {
  element: QuestionSelectModel & {
    fieldOptions: Array<FieldOptionSelectModel>
  }
  value: string,
  onChange: (value: any) => void
  id: string
  editMode?: boolean
}

const FormField = ({ element, value, onChange, id, editMode }: Props) => {
  if (!element) return null;

  if (editMode) {
    return (
      <div className="space-y-2">
        <Input
          value={element?.text ?? ""}
          onChange={(e) => onChange({ ...element, text: e.target.value })}
          placeholder="Question text"
        />
        <Select
          value={element?.fieldType ?? ""}
          onValueChange={(val) => onChange({ ...element, fieldType: val })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {['Input', 'Textarea', 'Switch', 'Select', 'RadioGroup'].map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(element.fieldType === 'Select' || element.fieldType === 'RadioGroup') && (
          <div className="space-y-2">
            {element.fieldOptions.map((opt, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={opt?.text ?? ""}
                  onChange={(e) => {
                    const updated = [...element.fieldOptions];
                    updated[index].text = e.target.value;
                    onChange({ ...element, fieldOptions: updated });
                  }}
                  placeholder="Option Text"
                />
                <Input
                  value={opt?.value ?? ""}
                  onChange={(e) => {
                    const updated = [...element.fieldOptions];
                    updated[index].value = e.target.value;
                    onChange({ ...element, fieldOptions: updated });
                  }}
                  placeholder="Option Value"
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onChange({
                  ...element,
                  fieldOptions: [...element.fieldOptions, { text: '', value: '' }],
                })
              }
            >
              + Add Option
            </Button>
          </div>
        )}
      </div>
    );
  }

  const components = {
    Input: () => <Input id={id} type="text" onChange={onChange} />,
    Switch: () => <Switch id={id} onCheckedChange={(checked) => onChange(checked ? "Yes" : "No")} />,
    Textarea: () => <Textarea id={id} onChange={(event) => onChange(event.target.value)} />,
    Select: () => (
      <Select onValueChange={onChange}>
        <SelectTrigger><SelectValue defaultValue={value} placeholder="Select option" /></SelectTrigger>
        <SelectContent>
          {element.fieldOptions.map((option) => (
            <SelectItem key={option.id} value={`answerId_${option.id}`}>{option.text}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
    RadioGroup: () => (
      <RadioGroup onValueChange={onChange}>
        {element.fieldOptions.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <FormControl>
              <RadioGroupItem value={`answerId_${option.id}`} id={option.value || `answerId_${option.id}`} />
            </FormControl>
            <Label htmlFor={option.value || `answerId_${option.id}`}>{option.text}</Label>
          </div>
        ))}
      </RadioGroup>
    ),
  };

  return element.fieldType && components[element.fieldType]
    ? components[element.fieldType]()
    : null;
};

export default FormField;
