// src/components/schedule/DayAppointmentsSidebar.tsx
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Appointment } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { es } from 'date-fns/locale';
import { CalendarDays, Clock, User, Info, X, Lock } from "lucide-react"; // Added Lock
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DayAppointmentsSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  appointmentsForDay: Appointment[];
}

export function DayAppointmentsSidebar({ isOpen, onOpenChange, selectedDate, appointmentsForDay }: DayAppointmentsSidebarProps) {
  if (!selectedDate) {
    return null;
  }

  const formattedDate = format(selectedDate, "PPPP", { locale: es });

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center text-xl">
            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
            Agenda para el {formattedDate}
          </SheetTitle>
          <SheetDescription>
            Listado de citas y bloqueos programados para este día.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
          {appointmentsForDay.length > 0 ? (
            <ul className="space-y-4">
              {appointmentsForDay.map((appointment) => (
                <li key={appointment.id} className={cn(
                  "rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow",
                  appointment.isBlocker && "bg-muted/70 border-dashed"
                )}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-primary text-md flex items-center">
                        {appointment.isBlocker ? <Lock className="mr-2 h-4 w-4 text-gray-500" /> : <Clock className="mr-2 h-4 w-4" />}
                        {format(parseISO(appointment.dateTime), "HH:mm", { locale: es })}
                        <span className="text-muted-foreground text-xs ml-2">({appointment.durationMinutes} min)</span>
                      </p>
                      {appointment.isBlocker ? (
                        <p className="text-sm text-gray-700 font-medium mt-1">{appointment.blockerReason || "Horario Bloqueado"}</p>
                      ) : (
                        appointment.patientName && (
                          <p className="text-sm flex items-center mt-1">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Link href={`/dashboard/patients/${appointment.patientId}`} className="hover:underline" onClick={() => onOpenChange(false)}>
                              {appointment.patientName}
                            </Link>
                          </p>
                        )
                      )}
                    </div>
                    {/* Status badge could be shown here for non-blockers if desired */}
                  </div>
                  {appointment.notes && !appointment.isBlocker && (
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-dashed">
                      <strong>Notas:</strong> {appointment.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Info className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay citas ni bloqueos para este día.</p>
            </div>
          )}
        </ScrollArea>
        <div className="mt-auto pt-4 border-t">
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                <X className="mr-2 h-4 w-4" /> Cerrar Panel
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

