
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
    caption_label: "text-sm font-medium",
    nav: "space-x-1 flex items-center",
    nav_button: cn(
      buttonVariants({ variant: "outline" }),
      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
    ),
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse space-y-1",
    head_row: "flex w-full",
    head_cell:
      "text-muted-foreground rounded-md flex-1 min-w-0 font-normal text-sm p-0 flex items-center justify-center",
    row: "flex w-full mt-2",
    cell:
      "h-9 flex-1 min-w-0 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
    
    day: cn(
      buttonVariants({ variant: "ghost" }), // Base button styles
      "h-full w-full p-0 font-normal aria-selected:opacity-100", // Fill cell, ensure visibility for selected
      "hover:bg-muted hover:text-muted-foreground", // Gray background for hover
      "hover:!h-8 hover:!w-8 hover:rounded-full" // Circle shape for hover
    ),
    
    day_today: (date, modifiers) => {
      if (modifiers.selected) {
        // If 'today' is also 'selected', 'day_selected' (green) will provide the main styling.
        // We might return a class for text color if needed for contrast, but primary color is whiteish.
        return "text-primary-foreground"; // Ensures text is visible if green from selected is somehow applied under this
      }
      // If just 'today' (not selected), apply celeste circle.
      return cn(
        "bg-primary text-primary-foreground !h-8 !w-8 rounded-full",
        "hover:bg-primary/90 focus-visible:bg-primary/90"
      );
    },

    day_selected: (date, modifiers) => {
      // Selected day is always a green circle
      return cn(
        "bg-accent text-accent-foreground !h-8 !w-8 rounded-full",
        "hover:bg-accent/90 focus-visible:bg-accent/90"
      );
    },
    
    day_outside:
      "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-accent-foreground aria-selected:opacity-30",
    day_disabled: "text-muted-foreground opacity-50",
    day_range_middle:
      "aria-selected:bg-accent aria-selected:text-accent-foreground",
    day_hidden: "invisible",
    day_range_end: "day-range-end",
  };

  const mergedClassNames = { ...defaultClassNames, ...classNames };
  
  // Ensure functional classNames are preserved if overridden by props
  // This logic ensures that if `classNames.day_today` (etc.) is passed as a prop, it's handled correctly.
  // For our case, we are defining the defaults directly.
  if (classNames?.day_today && typeof classNames.day_today === 'function') {
    mergedClassNames.day_today = classNames.day_today;
  } else if (classNames?.day_today && typeof defaultClassNames.day_today === 'function') {
     mergedClassNames.day_today = (d,m,o) => cn(defaultClassNames.day_today!(d,m,o) as string, classNames.day_today as string);
  }

  if (classNames?.day_selected && typeof classNames.day_selected === 'function') {
    mergedClassNames.day_selected = classNames.day_selected;
  } else if (classNames?.day_selected && typeof defaultClassNames.day_selected === 'function') {
    mergedClassNames.day_selected = (d,m,o) => cn(defaultClassNames.day_selected!(d,m,o) as string, classNames.day_selected as string);
  }


  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-full", className)} 
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
