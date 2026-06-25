"use client";

import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0", className)}
      classNames={{
        root: cn(defaultClassNames.root, "w-full"),
        months: cn(defaultClassNames.months, "flex flex-col gap-4"),
        month: cn(defaultClassNames.month, "space-y-3"),
        month_caption: cn(
          defaultClassNames.month_caption,
          "flex min-h-10 items-center justify-center px-10",
        ),
        caption_label: cn(
          defaultClassNames.caption_label,
          "font-mono text-[0.75rem] uppercase tracking-[0.1em] text-foreground",
        ),
        nav: cn(defaultClassNames.nav, "absolute inset-x-2 top-2 flex"),
        button_previous: cn(
          defaultClassNames.button_previous,
          "flex h-9 w-9 items-center justify-center rounded-[3px] border border-border text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-40",
        ),
        button_next: cn(
          defaultClassNames.button_next,
          "ml-auto flex h-9 w-9 items-center justify-center rounded-[3px] border border-border text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-40",
        ),
        month_grid: cn(
          defaultClassNames.month_grid,
          "w-full border-collapse space-y-1",
        ),
        weekdays: cn(defaultClassNames.weekdays, "grid grid-cols-7"),
        weekday: cn(
          defaultClassNames.weekday,
          "flex h-8 items-center justify-center font-mono text-[0.65rem] uppercase tracking-[0.08em] text-muted",
        ),
        week: cn(defaultClassNames.week, "grid grid-cols-7"),
        day: cn(defaultClassNames.day, "relative h-10 w-full p-0 text-center"),
        day_button: cn(
          defaultClassNames.day_button,
          "flex h-10 w-full items-center justify-center rounded-[3px] font-mono text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-1 focus:ring-primary",
        ),
        selected: cn(
          defaultClassNames.selected,
          "[&_button]:bg-primary [&_button]:text-primary-foreground [&_button]:hover:bg-primary [&_button]:hover:text-primary-foreground",
        ),
        today: cn(
          defaultClassNames.today,
          "[&_button]:border [&_button]:border-primary/60",
        ),
        outside: cn(defaultClassNames.outside, "opacity-35"),
        disabled: cn(defaultClassNames.disabled, "opacity-35"),
        range_start: cn(
          defaultClassNames.range_start,
          "rounded-l-[3px] bg-primary/10 [&_button]:rounded-r-none [&_button]:!bg-primary [&_button]:!text-primary-foreground",
        ),
        range_middle: cn(
          defaultClassNames.range_middle,
          "bg-primary/10 [&_button]:!rounded-none [&_button]:!bg-transparent [&_button]:!text-primary",
        ),
        range_end: cn(
          defaultClassNames.range_end,
          "rounded-r-[3px] bg-primary/10 [&_button]:rounded-l-none [&_button]:!bg-primary [&_button]:!text-primary-foreground",
        ),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className, ...chevronProps }) => {
          const Icon =
            orientation === "left"
              ? ChevronLeft
              : orientation === "right"
                ? ChevronRight
                : ChevronDown;
          return (
            <Icon className={cn("h-4 w-4", className)} {...chevronProps} />
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
