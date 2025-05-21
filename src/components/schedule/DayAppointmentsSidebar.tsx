// src/components/schedule/DayAppointmentsSidebar.tsx
"use client";

import type { SheetProps } from "react-day-picker"; // This import seems incorrect, should be related to Sheet component
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Appointment } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { es } from 'date-fns/locale';
import { Clock, User, Info, X, Lock, Trash2, CalendarClock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper functions for status (copied from schedule/page.tsx for simplicity)
const getStatusIcon = (status: Appointment['status']) => {
  switch (status) {
    case 'programada': return <CalendarClock className="mr-2 h-4 w-4 text-blue-500" />;
    case 'confirmada': return <CheckCircle className="mr-2 h-4 w-4 text-green-500" />;
    case 'cancelada': return <XCircle className="mr-2 h-4 w-4 text-red-500" />;
    case 'completada': return <CheckCircle className="mr-2 h-4 w-4 text-gray-500" />; // Or a different icon for completed
    default: return <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />;
  }
};

const getStatusText = (status: Appointment['status']) => {
  const map: Record<Appointment['status'], string> = {
    programada: "Programada",
    confirmada: "Confirmada",
    cancelada: "Cancelada",
    completada: "Completada"
  };
  return map[status] || status;
};


interface DayAppointmentsSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  appointmentsForDay: Appointment[];
  onStatusChange: (appointmentId: string, newStatus: Appointment['status']) => void;
  requestDeleteBlocker: (appointmentId: string) => void;
}

export function DayAppointmentsSidebar({ 
  isOpen, 
  onOpenChange, 
  selectedDate, 
  appointmentsForDay,
  onStatusChange,
  requestDeleteBlocker
}: DayAppointmentsSidebarProps) {
  if (!selectedDate) {
    return null;
  }

  const formattedDate = format(selectedDate, "PPPP", { locale: es });

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full flex flex-col">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-lg mt-2"> {/* Removed CalendarDays icon */}
            Agenda para el {formattedDate}
          </SheetTitle>
          <SheetDescription>
            Listado de citas y bloqueos programados para este día.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1 min-h-0 pr-4">
          {appointmentsForDay.length > 0 ? (
            <ul className="space-y-4">
              {appointmentsForDay.map((appointment) => (
                <li key={appointment.id} className={cn(
                  "rounded-lg border p-3 shadow-sm", // Reduced padding a bit from p-4 to p-3
                  appointment.isBlocker && "bg-muted/70 border-dashed"
                )}>
                  <div className="flex flex-col gap-2"> {/* Main content and actions in a column */}
                    <div> {/* Appointment/Blocker Info */}
                      <p className="font-semibold text-primary text-md flex items-center">
                        {appointment.isBlocker ? <Lock className="mr-2 h-4 w-4 text-gray-500" /> : <Clock className="mr-2 h-4 w-4" />}
                        {format(parseISO(appointment.dateTime), "HH:mm", { locale: es })}
                        <span className="text-muted-foreground text-xs ml-2">({appointment.durationMinutes} min)</span>
                      </p>
                      {appointment.isBlocker ? (
                        <p className="text-sm text-gray-700 font-medium mt-1 break-words">{appointment.blockerReason || "Horario Bloqueado"}</p>
                      ) : (
                        appointment.patientName && (
                          <p className="text-sm flex items-center mt-1">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Link href={`/dashboard/patients/${appointment.patientId}`} className="hover:underline break-words" onClick={() => onOpenChange(false)}>
                              {appointment.patientName}
                            </Link>
                          </p>
                        )
                      )}
                      {appointment.notes && !appointment.isBlocker && (
                        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-dashed break-words">
                          <strong>Notas:</strong> {appointment.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions Section */}
                    <div className="mt-2 pt-2 border-t border-dashed">
                      {!appointment.isBlocker ? (
                        <Select
                          value={appointment.status}
                          onValueChange={(newStatus) => onStatusChange(appointment.id, newStatus as Appointment['status'])}
                        >
                          <SelectTrigger className="w-full text-xs h-9">
                            <div className="flex items-center gap-1"> {/* Reduced gap for icon and text */}
                              {getStatusIcon(appointment.status)}
                              <span>{getStatusText(appointment.status)}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="programada">
                              <div className="flex items-center gap-2">{getStatusIcon("programada")} Programada</div>
                            </SelectItem>
                            <SelectItem value="confirmada">
                              <div className="flex items-center gap-2">{getStatusIcon("confirmada")} Confirmada</div>
                            </SelectItem>
                            <SelectItem value="cancelada">
                              <div className="flex items-center gap-2">{getStatusIcon("cancelada")} Cancelada</div>
                            </SelectItem>
                            <SelectItem value="completada">
                              <div className="flex items-center gap-2">{getStatusIcon("completada")} Completada</div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-destructive hover:bg-destructive/10"
                          onClick={() => requestDeleteBlocker(appointment.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar Bloqueo
                        </Button>
                      )}
                    </div>
                  </div>
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
        <div className="pt-2 border-t">
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
                <X className="mr-2 h-4 w-4" /> Cerrar Panel
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
