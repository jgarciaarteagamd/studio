
// src/app/dashboard/schedule/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogDescriptionComponent, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { mockPatients, getAppointments, addAppointment, type Appointment, type PatientRecord, getPatientFullName } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, CalendarIcon as LucideCalendarIcon, Clock, User, Edit3, Trash2, CheckCircle, AlertCircle, XCircle, CalendarClock, Lock, ShieldOff } from "lucide-react";
import { format, parseISO, setHours, setMinutes, startOfDay, startOfMonth, isSameMonth, isPast, isToday, isSameDay } from "date-fns";
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { DayAppointmentsSidebar } from "@/components/schedule/DayAppointmentsSidebar";

const appointmentFormSchema = z.object({
  patientId: z.string().optional(),
  date: z.date({ required_error: "La fecha es obligatoria." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)."),
  durationMinutes: z.coerce.number().min(5, "La duración debe ser al menos 5 minutos.").max(1440, "La duración no puede exceder 1 día (1440 min)."),
  notes: z.string().optional(),
  status: z.enum(['programada', 'confirmada', 'cancelada', 'completada']).default('programada'),
  isBlocker: z.boolean().optional().default(false),
  blockerReason: z.string().optional(),
}).refine(data => {
  if (data.isBlocker && !data.blockerReason) {
    return false;
  }
  if (!data.isBlocker && !data.patientId) {
    return false; 
  }
  return true;
}, {
  message: "Si es un bloqueo, debe indicar un motivo. Si es una cita, debe seleccionar un paciente.",
  path: ["isBlocker"], 
});


type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export default function SchedulePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const [currentLocale, setCurrentLocale] = useState('es-ES');
  const [displayedMonth, setDisplayedMonth] = useState<Date>(startOfMonth(new Date()));
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<Date | null>(null);
  const [isDaySidebarOpen, setIsDaySidebarOpen] = useState(false);

  useEffect(() => {
    setCurrentLocale(navigator.language || 'es-ES');
    setAppointments(getAppointments());
    setPatients(mockPatients); 
    setIsLoading(false);
  }, []);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: "",
      date: new Date(),
      time: "09:00",
      durationMinutes: 30,
      notes: "",
      status: "programada",
      isBlocker: false,
      blockerReason: "",
    },
  });

  const isBlockerWatch = form.watch("isBlocker");

  const openFormDialog = (blockerMode: boolean) => {
    const defaultDate = selectedCalendarDay && !isPast(selectedCalendarDay) || (selectedCalendarDay && isToday(selectedCalendarDay)) ? selectedCalendarDay : new Date();
    form.reset({ 
      patientId: "",
      date: defaultDate,
      time: "09:00",
      durationMinutes: blockerMode ? 60 : 30,
      notes: "",
      status: "programada",
      isBlocker: blockerMode,
      blockerReason: "",
    });
    form.setValue('isBlocker', blockerMode); 
    setIsFormOpen(true);
  };


  const onSubmit: SubmitHandler<AppointmentFormValues> = (data) => {
    const selectedDate = startOfDay(data.date);
    const [hours, minutes] = data.time.split(':').map(Number);
    const dateTime = setMinutes(setHours(selectedDate, hours), minutes);

    const newAppointmentData: Omit<Appointment, 'id' | 'patientName'> = {
      dateTime: dateTime.toISOString(),
      durationMinutes: data.durationMinutes,
      status: data.isBlocker ? 'programada' : data.status, 
      isBlocker: data.isBlocker,
    };

    if (data.isBlocker) {
      newAppointmentData.blockerReason = data.blockerReason;
      newAppointmentData.patientId = undefined; 
      newAppointmentData.notes = undefined;
    } else {
      newAppointmentData.patientId = data.patientId;
      newAppointmentData.notes = data.notes;
      newAppointmentData.blockerReason = undefined;
    }

    try {
      addAppointment(newAppointmentData);
      setAppointments(getAppointments()); 
      toast({
        title: data.isBlocker ? "Horario Bloqueado" : "Cita Agendada",
        description: data.isBlocker ? "El periodo ha sido bloqueado exitosamente." : "La nueva cita ha sido programada exitosamente.",
      });
      setIsFormOpen(false);
      // No reseteamos selectedCalendarDay aquí para que el sidebar se mantenga si estaba abierto
    } catch (error) {
      console.error("Error agendando/bloqueando:", error);
      toast({
        title: "Error",
        description: (error as Error).message || (data.isBlocker ? "No se pudo bloquear el horario." : "No se pudo agendar la cita."),
        variant: "destructive",
      });
    }
  };
  
  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'programada': return <CalendarClock className="h-4 w-4 text-blue-500" />;
      case 'confirmada': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelada': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completada': return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  const getStatusText = (status: Appointment['status']) => {
    const map = {
      programada: "Programada",
      confirmada: "Confirmada",
      cancelada: "Cancelada",
      completada: "Completada"
    };
    return map[status] || status;
  };

  const groupedAppointments = useMemo(() => {
    return appointments.reduce((acc, appointment) => {
      const dateKey = format(parseISO(appointment.dateTime), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(appointment);
      return acc;
    }, {} as Record<string, Appointment[]>);
  }, [appointments]);

  const sortedGroupKeys = useMemo(() => Object.keys(groupedAppointments).sort(), [groupedAppointments]);

  const daysWithAppointments = useMemo(() => {
    return appointments.map(app => parseISO(app.dateTime));
  }, [appointments]);

  const calendarModifiers = {
    hasAppointments: daysWithAppointments,
    selected: selectedCalendarDay || undefined, 
  };
  const calendarModifiersClassNames = {
    hasAppointments: 'day-with-appointments',
  };

  const handleCalendarDayClick = useCallback((day: Date | undefined) => {
    if (day) {
      setSelectedCalendarDay(day);
      setIsDaySidebarOpen(true);
    }
  }, []);

  const appointmentsOnSelectedDay = useMemo(() => {
    if (!selectedCalendarDay) return [];
    return appointments.filter(app =>
      isSameDay(parseISO(app.dateTime), selectedCalendarDay)
    ).sort((a, b) => parseISO(a.dateTime).getTime() - parseISO(b.dateTime).getTime());
  }, [appointments, selectedCalendarDay]);


  return (
    <div className="max-w-5xl mx-auto">
      <div className="space-y-6 w-full">
      
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda de Citas</h1>
            <p className="text-muted-foreground">
              Ver y programar citas o bloqueos de horario.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="lg" onClick={() => openFormDialog(false)}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Programar Cita
            </Button>
            <Button size="lg" variant="outline" onClick={() => openFormDialog(true)}>
              <ShieldOff className="mr-2 h-5 w-5" />
              Bloquear Horario
            </Button>
          </div>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isBlockerWatch ? "Bloquear Horario" : "Programar Nueva Cita"}</DialogTitle>
              <DialogDescriptionComponent>Complete los detalles para la nueva {isBlockerWatch ? "entrada de bloqueo" : "cita"}.</DialogDescriptionComponent>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
                
                {!isBlockerWatch && (
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paciente</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un paciente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {patients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {getPatientFullName(patient)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span>Seleccione una fecha</span>
                                )}
                                <LucideCalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                if (date) {
                                   if (!isPast(date) || isToday(date)) {
                                    field.onChange(date)
                                  } else {
                                     toast({title: "Fecha Pasada", description: "No se puede seleccionar una fecha pasada.", variant: "default"})
                                  }
                                }
                              }}
                              initialFocus
                              locale={es}
                              disabled={(date) => isPast(date) && !isToday(date)}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración (minutos)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {isBlockerWatch ? (
                   <FormField
                    control={form.control}
                    name="blockerReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivo del Bloqueo</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Ej: Almuerzo, Reunión importante, Mantenimiento" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas Adicionales (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Notas sobre la cita, motivo, etc." {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {!isBlockerWatch && ( 
                   <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="programada">Programada</SelectItem>
                              <SelectItem value="confirmada">Confirmada</SelectItem>
                              <SelectItem value="cancelada">Cancelada</SelectItem>
                              <SelectItem value="completada">Completada</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Guardando..." : (isBlockerWatch ? "Guardar Bloqueo" : "Guardar Cita")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Card className="shadow-lg max-w-2xl mx-auto w-full">
          <CardHeader>
            <CardTitle>Calendario de Citas</CardTitle>
            <CardDescription>Navegue por los meses y haga clic en un día para ver las citas programadas. Use los botones superiores para agendar.</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
             <Calendar
              className="rounded-md border shadow-md w-full"
              mode="single"
              selected={selectedCalendarDay || undefined}
              onSelect={handleCalendarDayClick}
              month={displayedMonth}
              onMonthChange={setDisplayedMonth}
              modifiers={calendarModifiers}
              modifiersClassNames={calendarModifiersClassNames}
              locale={es}
              classNames={{
                  caption_label: "text-lg font-medium",
                  head_cell: cn(
                    "text-muted-foreground rounded-md flex-1 min-w-0 font-normal text-sm p-0 text-center",
                    "h-10 sm:h-12 md:h-14" 
                  ),
                  cell: cn(
                    "flex-1 min-w-0 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    "flex items-center justify-center", 
                    "h-10 sm:h-12 md:h-14" 
                  ),
                  day: (date, modifiers, dayProps) => {
                      let klasses = cn(
                        buttonVariants({ variant: "ghost" }),
                        "h-full w-full p-0 font-normal", 
                        "text-foreground" // Asegura que el texto del número sea siempre oscuro
                      );
                    
                      if (modifiers.selected) {
                        klasses = cn(klasses, "bg-primary/70 !h-8 !w-8 rounded-full text-foreground"); 
                      } else if (modifiers.today && !modifiers.selected) {
                        klasses = cn(klasses, "ring-1 ring-primary rounded-full text-foreground");
                      } else if (modifiers.interactive && !modifiers.disabled && dayProps.onPointerEnter && !modifiers.selected && !modifiers.today) {
                        klasses = cn(klasses, "hover:bg-muted hover:!h-8 hover:!w-8 hover:rounded-full text-foreground");
                      }
                      
                      if (modifiers.disabled) {
                        klasses = cn(klasses, "opacity-50 text-foreground");
                      }
                      if (modifiers.outside) {
                         klasses = cn(klasses, "text-muted-foreground opacity-50");
                         if (modifiers.selected) { 
                            klasses = cn(klasses, "bg-primary/20 text-foreground"); 
                         }
                      }
                      return klasses;
                    },
              }}
            />
          </CardContent>
        </Card>

        <DayAppointmentsSidebar
          isOpen={isDaySidebarOpen}
          onOpenChange={setIsDaySidebarOpen}
          selectedDate={selectedCalendarDay}
          appointmentsForDay={appointmentsOnSelectedDay}
        />

        {isLoading ? (
          <p>Cargando agenda...</p>
        ) : sortedGroupKeys.length > 0 ? (
          <div className="space-y-8 w-full">
            {sortedGroupKeys.map(dateKey => (
              <Card key={dateKey} className="shadow-md overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {format(parseISO(dateKey), "PPPP", { locale: es })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {groupedAppointments[dateKey].sort((a,b) => parseISO(a.dateTime).getTime() - parseISO(b.dateTime).getTime()).map((appointment) => (
                      <li key={appointment.id} className={cn(
                        "border p-4 rounded-lg hover:shadow-lg transition-shadow",
                        appointment.isBlocker && "bg-muted/70 border-dashed" 
                      )}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                          <div>
                            <p className="font-semibold text-primary text-lg flex items-center">
                              {appointment.isBlocker ? <Lock className="mr-2 h-5 w-5 text-gray-500" /> : <Clock className="mr-2 h-5 w-5" />}
                              {format(parseISO(appointment.dateTime), "HH:mm", { locale: es })}
                              <span className="text-muted-foreground text-sm ml-2">({appointment.durationMinutes} min)</span>
                            </p>
                            <p className="text-md flex items-center mt-1 break-words">
                              {appointment.isBlocker ? (
                                <span className="text-gray-700 font-medium ">{appointment.blockerReason || "Horario Bloqueado"}</span>
                              ) : (
                                <>
                                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span className="break-words">{appointment.patientName}</span>
                                </>
                              )}
                            </p>
                          </div>
                          {!appointment.isBlocker && (
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                              <span className={cn("text-xs font-medium mr-2 inline-flex items-center px-2.5 py-0.5 rounded-full", {
                                "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200": appointment.status === "programada",
                                "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200": appointment.status === "confirmada" || appointment.status === "completada",
                                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200": appointment.status === "cancelada",
                              })}>
                                {getStatusIcon(appointment.status)}
                                <span className="ml-1">{getStatusText(appointment.status)}</span>
                              </span>
                            </div>
                          )}
                        </div>
                        {appointment.notes && !appointment.isBlocker && (
                          <p className="text-sm text-muted-foreground mt-2 pt-2 border-t border-dashed break-words">
                            <strong>Notas:</strong> {appointment.notes}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-lg text-muted-foreground">No hay citas ni bloqueos programados.</p>
              <Button className="mt-4" onClick={() => openFormDialog(false)}>
                <PlusCircle className="mr-2 h-5 w-5" />
                Programar la Primera Cita
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

