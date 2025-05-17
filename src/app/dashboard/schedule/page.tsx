// src/app/dashboard/schedule/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { mockPatients, getAppointments, addAppointment, type Appointment, type PatientRecord } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, CalendarIcon as LucideCalendarIcon, Clock, User, Edit3, Trash2, CheckCircle, AlertCircle, XCircle, CalendarClock } from "lucide-react";
import { format, parseISO, setHours, setMinutes, startOfDay, startOfMonth, isSameMonth, isPast, isToday, isSameDay } from "date-fns";
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { DayAppointmentsSidebar } from "@/components/schedule/DayAppointmentsSidebar";

const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Debe seleccionar un paciente."),
  date: z.date({ required_error: "La fecha es obligatoria." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)."),
  durationMinutes: z.coerce.number().min(5, "La duración debe ser al menos 5 minutos.").max(240, "La duración no puede exceder 240 minutos."),
  notes: z.string().optional(),
  status: z.enum(['programada', 'confirmada', 'cancelada', 'completada']).default('programada'),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export default function SchedulePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false); // For new appointment dialog
  const { toast } = useToast();
  const [currentLocale, setCurrentLocale] = useState('es-ES');
  const [displayedMonth, setDisplayedMonth] = useState<Date>(startOfMonth(new Date()));

  // States for DayAppointmentsSidebar
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
    },
  });

  const onSubmit: SubmitHandler<AppointmentFormValues> = (data) => {
    const selectedDate = startOfDay(data.date);
    const [hours, minutes] = data.time.split(':').map(Number);
    const dateTime = setMinutes(setHours(selectedDate, hours), minutes);

    const newAppointmentData = {
      patientId: data.patientId,
      dateTime: dateTime.toISOString(),
      durationMinutes: data.durationMinutes,
      notes: data.notes,
      status: data.status,
    };

    try {
      addAppointment(newAppointmentData);
      setAppointments(getAppointments()); 
      toast({
        title: "Cita Agendada",
        description: "La nueva cita ha sido programada exitosamente.",
      });
      setIsFormOpen(false);
      form.reset({ 
        patientId: "",
        date: new Date(),
        time: "09:00",
        durationMinutes: 30,
        notes: "",
        status: "programada",
      });
    } catch (error) {
      console.error("Error agendando cita:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "No se pudo agendar la cita.",
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
    selected: selectedCalendarDay || undefined, // Highlight the selected day for the sidebar
  };
  const calendarModifiersClassNames = {
    hasAppointments: 'day-with-appointments',
    selected: 'rdp-day_selected', // Standard class for selected day styling
  };

  const handleCalendarDayClick = useCallback((day: Date | undefined) => {
    if (day) {
      setSelectedCalendarDay(day);
      setIsDaySidebarOpen(true);
      // Do not open new appointment form here
    }
  }, []);

  const appointmentsOnSelectedDay = useMemo(() => {
    if (!selectedCalendarDay) return [];
    return appointments.filter(app =>
      isSameDay(parseISO(app.dateTime), selectedCalendarDay)
    ).sort((a, b) => parseISO(a.dateTime).getTime() - parseISO(b.dateTime).getTime());
  }, [appointments, selectedCalendarDay]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda de Citas</h1>
          <p className="text-muted-foreground">
            Ver y programar citas para los pacientes.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button size="lg" onClick={() => { 
              form.reset({
                patientId: "",
                date: new Date(),
                time: "09:00",
                durationMinutes: 30,
                notes: "",
                status: "programada",
              }); 
              setIsFormOpen(true); 
            }}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Programar Nueva Cita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Programar Nueva Cita</DialogTitle>
              <DialogDescription>Complete los detalles para la nueva cita.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
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
                              {patient.personalDetails.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de la Cita</FormLabel>
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
                        <FormLabel>Hora de la Cita</FormLabel>
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
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Adicionales (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Notas sobre la cita, motivo, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado de la Cita</FormLabel>
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
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Guardando..." : "Guardar Cita"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Calendario de Citas</CardTitle>
          <CardDescription>Navegue por los meses y haga clic en un día para ver las citas programadas. Use el botón "+ Programar Nueva Cita" para agendar.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-4 md:p-6">
          <Calendar
            mode="single" 
            selected={selectedCalendarDay || undefined} 
            onSelect={handleCalendarDayClick} 
            month={displayedMonth}
            onMonthChange={setDisplayedMonth}
            modifiers={calendarModifiers}
            modifiersClassNames={calendarModifiersClassNames}
            locale={es}
            className="rounded-md border shadow-md w-full" 
            classNames={{
                caption_label: "text-lg font-medium",
                head_cell: "w-10 sm:w-12 md:w-14 text-center p-0", 
                day: "h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14", 
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
        <div className="space-y-8">
          {sortedGroupKeys.map(dateKey => (
            <Card key={dateKey} className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">
                  {format(parseISO(dateKey), "PPPP", { locale: es })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {groupedAppointments[dateKey].sort((a,b) => parseISO(a.dateTime).getTime() - parseISO(b.dateTime).getTime()).map((appointment) => (
                    <li key={appointment.id} className="border p-4 rounded-lg hover:shadow-lg transition-shadow">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                          <p className="font-semibold text-primary text-lg flex items-center">
                            <Clock className="mr-2 h-5 w-5" />
                            {format(parseISO(appointment.dateTime), "HH:mm", { locale: es })}
                            <span className="text-muted-foreground text-sm ml-2">({appointment.durationMinutes} min)</span>
                          </p>
                          <p className="text-md flex items-center mt-1">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            {appointment.patientName}
                          </p>
                        </div>
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
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-muted-foreground mt-2 pt-2 border-t border-dashed">
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
            <p className="text-lg text-muted-foreground">No hay citas programadas.</p>
            <Button className="mt-4" onClick={() => { form.reset(); setIsFormOpen(true); }}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Programar la Primera Cita
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
