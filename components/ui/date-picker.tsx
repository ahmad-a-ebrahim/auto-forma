import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format as formatFn } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./calendar";

type Props = {
  id: string;
  value: Date;
  onChange: (val: any) => void;
  disabled?: boolean;
  placeholder?: string;
  format?: string;
  className?: string;
};

const DatePicker = ({
  id,
  value,
  onChange,
  disabled = false,
  placeholder = "Pick a date",
  format = "yyyy-MM-dd",
  className,
}: Props) => {
  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value ? formatFn(value, format) : <span>{placeholder}</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          id={id}
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={!!disabled}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
