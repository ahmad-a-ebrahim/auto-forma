import React, { ChangeEvent } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormControl } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { QuestionSelectModel } from '@/types/form-types';
import { FieldOptionSelectModel } from '@/types/form-types';
import { Label } from '@/components/ui/label';

type Props = {
  element: QuestionSelectModel & {
    fieldOptions: Array<FieldOptionSelectModel>
  }
  value: string,
  onChange: (value?: string | ChangeEvent<HTMLInputElement>) => void
  id: string
}

const FormField = ({ element, value, onChange, id }: Props) => {
  if (!element) return null;

  const components = {
    Input: () => <Input id={id} type="text" onChange={onChange} />,
    Switch: () => <Switch id={id} onCheckedChange={(checked) => onChange(checked ? "Yes" : "No")} />,
    Textarea: () => <Textarea id={id} onChange={(event) => onChange(event.target.value)} />,
    Select: () => (
      <Select onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue defaultValue={value} placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          {element.fieldOptions.map((option, index) => (
            <SelectItem key={`${option.text} ${option.value}`} value={`answerId_${option.id}`}>{option.text}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
    RadioGroup: () => (
      <RadioGroup onValueChange={onChange}>
        {element.fieldOptions.map((option, index) => (
          <div key={`${option.text} ${option.value}`} className='flex items-center space-x-2'>
            <FormControl>
              <RadioGroupItem value={`answerId_${option.id}`} id={option?.value?.toString() || `answerId_${option.id}`}>{option.text}</RadioGroupItem>
            </FormControl>
            <Label htmlFor={option?.value?.toString() || `answerId_${option.id}`} className='text-base'>{option.text}</Label>
          </div>
        ))}
      </RadioGroup>
    )
  }

  return element.fieldType && components[element.fieldType] ? components[element.fieldType]() : null;
}

export default FormField
