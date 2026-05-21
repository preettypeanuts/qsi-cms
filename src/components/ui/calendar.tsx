"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-4",
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "font-medium text-sm",
        nav: "absolute inset-x-3 top-3 flex items-center justify-between",
        button_previous:
          "grid size-7 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
        button_next:
          "grid size-7 place-items-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "w-9 rounded-md text-center font-normal text-slate-500 text-xs",
        week: "mt-2 flex w-full",
        day: "size-9 p-0 text-center text-sm",
        day_button:
          "grid size-9 place-items-center rounded-md font-normal text-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-200",
        selected:
          "[&>button]:bg-slate-950 [&>button]:text-white [&>button]:hover:bg-slate-950",
        today: "[&>button]:bg-sky-50 [&>button]:text-sky-700",
        outside: "text-slate-300",
        disabled: "text-slate-300 opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
