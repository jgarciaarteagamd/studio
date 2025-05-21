
// src/app/dashboard/schedule/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogDescriptionComponent, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { mockPatients, getAppointments, addAppointment, type Appointment, type PatientRecord, getPatientFullName, updateAppointmentStatus as apiUpdateAppointmentStatus, deleteAppointment as apiDeleteAppointment } from "@/lib/mock-data";
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
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);


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
    const map: Record<Appointment['status'], string> = {
      programada: "Programada",
      confirmada: "Confirmada",
      cancelada: "Cancelada",
      completada: "Completada"
    };
    return map[status] || status;
  };

  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    const updatedAppointment = apiUpdateAppointmentStatus(appointmentId, newStatus);
    if (updatedAppointment) {
      setAppointments(prevAppointments =>
        prevAppointments.map(app =>
          app.id === appointmentId ? { ...app, status: newStatus } : app
        )
      );
      toast({
        title: "Estado Actualizado",
        description: `El estado de la cita ha sido cambiado a "${getStatusText(newStatus)}".`,
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la cita.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (appointmentToDelete) {
      const success = apiDeleteAppointment(appointmentToDelete);
      if (success) {
        setAppointments(prev => prev.filter(app => app.id !== appointmentToDelete));
        toast({ title: "Bloqueo Eliminado", description: "El bloqueo de horario ha sido eliminado." });
      } else {
        toast({ title: "Error", description: "No se pudo eliminar el bloqueo.", variant: "destructive" });
      }
      setAppointmentToDelete(null); // Close dialog
    }
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
    <div className="max-w-5xl mx-auto w-full">
      <div className="space-y-6 w-full">
      
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda de Citas</h1>
            <p className="text-muted-foreground">
              Ver y programar citas o bloqueos de horario.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button size="lg" onClick={() => openFormDialog(false)} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" />
              Programar Cita
            </Button>
            <Button size="lg" variant="outline" onClick={() => openFormDialog(true)} className="w-full sm:w-auto">
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
        
        <Card className="shadow-lg w-full overflow-hidden max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
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
                  head_cell: cn("text-muted-foreground rounded-md flex-1 min-w-0 font-normal text-xs sm:text-sm p-0 text-center", "h-8 sm:h-10 md:h-12" ),
                  cell: cn("flex-1 min-w-0 text-center text-xs sm:text-sm p-0 relative flex items-center justify-center", "h-8 sm:h-10 md:h-12"),
                  day: (date, modifiers) => {
                    let klasses = cn(
                      buttonVariants({ variant: "ghost" }),
                      "h-full w-full p-0 font-normal", 
                      "text-xs sm:text-sm flex items-center justify-center",
                      "text-foreground" 
                    );
                  
                    if (modifiers.selected) {
                      klasses = cn(klasses, "bg-primary/70 !h-6 !w-6 sm:!h-7 sm:!w-7 rounded-full text-foreground hover:bg-primary/80"); 
                    } else if (modifiers.today && !modifiers.selected) {
                      klasses = cn(klasses, "ring-1 ring-primary rounded-full text-foreground");
                    } else if (modifiers.interactive && !modifiers.disabled && !modifiers.selected && !modifiers.today) {
                      klasses = cn(klasses, "hover:bg-muted hover:!h-6 hover:!w-6 sm:hover:!h-7 sm:hover:!w-7 hover:rounded-full text-foreground");
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
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-grow">
                            <p className="font-semibold text-primary text-lg flex items-center">
                              {appointment.isBlocker ? <Lock className="mr-2 h-5 w-5 text-gray-500" /> : <Clock className="mr-2 h-5 w-5" />}
                              {format(parseISO(appointment.dateTime), "HH:mm", { locale: es })}
                              <span className="text-muted-foreground text-sm ml-2">({appointment.durationMinutes} min)</span>
                            </p>
                            <p className="text-md flex items-center mt-1 break-words">
                              {appointment.isBlocker ? (
                                <span className="text-gray-700 font-medium break-words">{appointment.blockerReason || "Horario Bloqueado"}</span>
                              ) : (
                                <>
                                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span className="break-words">{appointment.patientName}</span>
                                </>
                              )}
                            </p>
                             {appointment.notes && !appointment.isBlocker && (
                                <p className="text-sm text-muted-foreground mt-2 pt-2 border-t border-dashed break-words">
                                    <strong>Notas:</strong> {appointment.notes}
                                </p>
                            )}
                          </div>
                          <div className="flex-shrink-0 w-full sm:w-auto">
                            {!appointment.isBlocker ? (
                              <Select
                                value={appointment.status}
                                onValueChange={(newStatus) => handleStatusChange(appointment.id, newStatus as Appointment['status'])}
                              >
                                <SelectTrigger className="w-full sm:w-[180px] text-xs h-9">
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(appointment.status)}
                                    <span>{getStatusText(appointment.status)}</span>
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="programada">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon("programada")} Programada
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="confirmada">
                                    <div className="flex items-center gap-2">
                                     {getStatusIcon("confirmada")} Confirmada
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="cancelada">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon("cancelada")} Cancelada
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="completada">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon("completada")} Completada
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setAppointmentToDelete(appointment.id)} className="w-full sm:w-auto text-destructive hover:bg-destructive/10">
                                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar Bloqueo
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. Esto eliminará permanentemente el bloqueo de horario.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setAppointmentToDelete(null)}>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteConfirm}>Continuar</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
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

