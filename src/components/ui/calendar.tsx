
// src/components/ui/calendar.tsx
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type ClassNameFormatter, type Modifiers, type DayProps } from "react-day-picker"
import { es } from 'date-fns/locale'; 

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = es, 
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
      "text-muted-foreground rounded-md flex-1 min-w-0 font-normal text-sm p-0 flex items-center justify-center", // Height controlled by schedule/page.tsx
    row: "flex w-full mt-2",
    cell:
      "flex-1 min-w-0 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20", // Height controlled by schedule/page.tsx
    
    day: (date: Date, modifiers: Modifiers, dayProps: DayProps) => {
      let klasses = cn(
        buttonVariants({ variant: "ghost" }), 
        "h-full w-full p-0 font-normal text-foreground aria-selected:opacity-100" 
      );
      // Apply gray circle hover ONLY if day is interactive, not today, AND not selected
      if (modifiers.interactive && !modifiers.today && !modifiers.selected && !modifiers.disabled) {
        klasses = cn(klasses, "hover:bg-muted hover:!h-8 hover:!w-8 hover:rounded-full");
      }
      return klasses;
    },
    
    day_today: (date: Date, modifiers: Modifiers, dayProps: DayProps) => {
      let classes = "text-foreground"; 
      if (modifiers.selected) {
        // If today is selected, day_selected (green circle) will take over.
        // No specific background needed here from day_today itself.
      } else if (!modifiers.disabled) {
        // Today, not selected: Celeste circle
        classes = cn(classes, "bg-primary !h-8 !w-8 rounded-full hover:bg-primary/90");
      }
      return classes;
    },

    day_selected: (date: Date, modifiers: Modifiers, dayProps: DayProps) => {
      // Selected: Green circle, black text. Overrides other states for background and shape.
      // This includes hover for selected state.
      let klasses = "text-foreground bg-accent !h-8 !w-8 rounded-full";
      if (!modifiers.disabled) {
        klasses = cn(klasses, "hover:bg-accent/90");
      }
      return klasses;
    },
    
    day_outside:
      "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30", // Changed text for selected outside days
    day_disabled: "text-muted-foreground opacity-50",
    day_range_middle:
      "aria-selected:bg-accent aria-selected:text-accent-foreground", // This might need text-foreground if accent-foreground is light
    day_hidden: "invisible",
    day_range_end: "day-range-end",
  };

  const mergedClassNames = { ...defaultClassNames };
  if (classNames) {
    for (const key in classNames) {
      const K = key as keyof typeof classNames;
      if (typeof classNames[K] === 'string' && typeof mergedClassNames[K] === 'string') {
        mergedClassNames[K] = cn(mergedClassNames[K] as string, classNames[K] as string);
      } else if (classNames[K]) { 
         mergedClassNames[K] = classNames[K] as any;
      }
    }
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

