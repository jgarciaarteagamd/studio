
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
      "text-muted-foreground rounded-md flex-1 min-w-0 font-normal text-sm p-0 flex items-center justify-center", // flex-1 para distribuir, centrado
    
    row: "flex w-full mt-2",
    cell: cn( // Celda que contiene el botón del día
      "flex-1 min-w-0 text-sm p-0 relative focus-within:relative focus-within:z-20", // Base structural and focus styles
      "flex items-center justify-center" // Centra el botón del día dentro de la celda
    ),
    
    day: (date: Date, modifiers: Modifiers, dayProps: DayProps) => {
      let klasses = cn(
        buttonVariants({ variant: "ghost" }), 
        "h-full w-full p-0 font-normal text-foreground" // Por defecto, el botón llena la celda, texto oscuro.
      );

      if (modifiers.selected) {
        klasses = cn(
          klasses,
          "bg-primary/70 !h-8 !w-8 rounded-full text-foreground" // Celeste degradado para selección, círculo pequeño
        );
      } else if (modifiers.today) {
        // Indicador sutil para "hoy" (no seleccionado): un anillo celeste. No cambia tamaño.
        klasses = cn(
          klasses,
          "ring-1 ring-primary rounded-full" // Mantiene h-full w-full del botón base.
        );
      } else if (modifiers.interactive && !modifiers.disabled && dayProps.onPointerEnter) {
        // Hover en días normales: círculo gris pequeño
        klasses = cn(
          klasses,
          "hover:bg-muted hover:!h-8 hover:!w-8 hover:rounded-full hover:text-foreground"
        );
      }
      
      if (modifiers.disabled) {
        klasses = cn(klasses, "opacity-50"); // No cambia color de texto, solo opacidad
      }
      if (modifiers.outside) {
         klasses = cn(klasses, "text-muted-foreground opacity-50");
         if (modifiers.selected) { // Si un día exterior está seleccionado (ej. en un rango)
            klasses = cn(klasses, "bg-primary/20"); // Fondo aún más degradado
         }
      }
      return klasses;
    },
    day_selected: undefined, // Manejado completamente por la función 'day'
    day_today: undefined,    // Manejado completamente por la función 'day'
    
    day_outside: "day-outside aria-selected:bg-transparent", // Evitar que react-day-picker ponga fondos en celdas exteriores seleccionadas
    day_disabled: "", // Los estilos de deshabilitado se manejan en la función 'day'
    day_range_middle: "aria-selected:bg-transparent",
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
