"use client";

import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DateRangePicker({
  value,
  onChange,
  className,
}: {
  value: DateRange | undefined;
  onChange: (value: DateRange | undefined) => void;
  className?: string;
}) {
  const label = value?.from
    ? value.to
      ? `${format(value.from, "LLL dd, y")} - ${format(value.to, "LLL dd, y")}`
      : format(value.from, "LLL dd, y")
    : "Filter by date";

  return (
    <div className={cn("flex min-w-0 gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-[3px] border border-border bg-background px-3 text-left font-sans text-sm text-foreground transition-colors hover:border-primary sm:min-h-11",
              !value?.from && "text-muted",
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{label}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(calc(100vw-2rem),22rem)] p-3"
        >
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            defaultMonth={value?.from}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
      {value?.from && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[3px] border border-border text-muted transition-colors hover:border-primary hover:text-primary sm:h-11 sm:w-11"
          aria-label="Clear date filter"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
