
// src/components/ui/calendar.tsx
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type ClassNameFormatter, type Modifiers } from "react-day-picker"
import { es } from 'date-fns/locale'; // Import Spanish locale

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = es, // Set default locale to Spanish
  ...props
}: CalendarProps) {
  const defaultClassNames: Partial<Record<keyof ReturnType<ClassNameFormatter>, string | ((date: Date, modifiers: Modifiers, options?: CalendarProps) => string | undefined)>> = {
    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
    month: "space-y-4 w-full",
    caption: "flex justify-center pt-1 relative items-center",
    caption_label: "text-sm font-medium", // Base, can be overridden by classNames prop
    nav: "space-x-1 flex items-center",
    nav_button: cn(
      buttonVariants({ variant: "outline" }),
      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
    ),
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse space-y-1",
    head_row: "flex w-full",
    head_cell: // Base style for day names (Lu, Ma, etc.)
      "text-muted-foreground rounded-md flex-1 min-w-0 font-normal text-sm p-0 flex items-center justify-center",
    row: "flex w-full mt-2",
    cell: // Base style for a date cell
      "h-9 flex-1 min-w-0 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
    day: cn( // Base style for a day button
      buttonVariants({ variant: "ghost" }),
      "h-full w-full p-0 font-normal aria-selected:opacity-100" 
    ),
    day_range_end: "day-range-end",
    day_selected: (date, modifiers) => {
      const classes = ["!h-8 !w-8", "rounded-full"]; // Common size/shape for selected state
      if (modifiers.today) {
        // If day is "today" AND "selected", "today" styles (green) should dominate.
        // day_today class will provide the green background.
        // This class for selected only ensures text color matches accent's foreground.
        classes.push("text-accent-foreground"); 
      } else {
        // If day is "selected" but NOT "today", apply primary theme (blue).
        classes.push("bg-primary", "text-primary-foreground", "hover:bg-primary/90", "focus:bg-primary");
      }
      return cn(classes);
    },
    day_today: // For "today" (green as per accent theme color)
      "bg-accent text-accent-foreground hover:bg-accent/90 focus:bg-accent !h-8 !w-8 rounded-full",
    day_outside:
      "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
    day_disabled: "text-muted-foreground opacity-50",
    day_range_middle:
      "aria-selected:bg-accent aria-selected:text-accent-foreground",
    day_hidden: "invisible",
  };

  const mergedClassNames = { ...defaultClassNames, ...classNames };
  
  // Ensure functional classNames are preserved if overridden
  if (classNames?.day_selected && typeof classNames.day_selected === 'function') {
    mergedClassNames.day_selected = classNames.day_selected;
  }
  if (classNames?.day_today && typeof classNames.day_today === 'function') {
    mergedClassNames.day_today = classNames.day_today;
  }


  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-full", className)} // p-3 was removed here, relying on CardContent for padding
      classNames={mergedClassNames as Required<Parameters<typeof DayPicker>[0]['classNames']>}
      components={{
        IconLeft: ({ className: iconClassName, ...restIconProps }) => ( 
          <ChevronLeft className={cn("h-4 w-4", iconClassName)} {...restIconProps} />
        ),
        IconRight: ({ className: iconClassName, ...restIconProps }) => ( 
          <ChevronRight className={cn("h-4 w-4", iconClassName)} {...restIconProps} />
        ),
      }}
      locale={locale} 
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
