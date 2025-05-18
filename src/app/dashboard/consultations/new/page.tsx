// src/app/dashboard/consultations/new/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { mockPatients, getPatientById, addMedicalEncounterToPatient, getPatientFullName, type NewConsultationData } from '@/lib/mock-data';
import type { PatientRecord, MedicalEncounter } from '@/lib/types';
import { User, FileText, History, PlusCircle, Search, ListChecks, Activity, Microscope, Stethoscope as StethoscopeIcon, Brain } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

const consultationFormSchema = z.object({
  anamnesis: z.string().min(1, "La anamnesis es obligatoria."),
  exploracionFisica: z.string().min(1, "La exploración física es obligatoria."),
  estudiosComplementarios: z.string().optional(),
  impresionDiagnostica: z.string().min(1, "La impresión diagnóstica es obligatoria."),
  plan: z.string().min(1, "El plan es obligatorio."),
});

type ConsultationFormValues = z.infer<typeof consultationFormSchema>;

export default function NewConsultationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [allPatients, setAllPatients] = useState<PatientRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('es-ES');

  useEffect(() => {
    setCurrentLocale(navigator.language || 'es-ES');
    setAllPatients(mockPatients); // Cargar todos los pacientes inicialmente
  }, []);

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return []; // No mostrar nada hasta que se busque
    return allPatients.filter(patient => {
      const fullName = `${patient.personalDetails.nombres} ${patient.personalDetails.apellidos}`.toLowerCase();
      const doc = patient.personalDetails.documentoIdentidad?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return fullName.includes(term) || doc.includes(term);
    }).slice(0, 5); // Limitar a 5 resultados para no saturar la UI
  }, [searchTerm, allPatients]);

  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: {
      anamnesis: '',
      exploracionFisica: '',
      estudiosComplementarios: '',
      impresionDiagnostica: '',
      plan: '',
    },
  });

  const handleSelectPatient = (patient: PatientRecord) => {
    setIsLoadingPatient(true);
    // Simular carga de datos del paciente
    setTimeout(() => {
      setSelectedPatient(patient);
      setSearchTerm(''); // Limpiar búsqueda
      setIsLoadingPatient(false);
      form.reset(); // Limpiar formulario de consulta anterior
    }, 300);
  };

  const onSubmit: SubmitHandler<ConsultationFormValues> = async (data) => {
    if (!selectedPatient) {
      toast({ title: "Error", description: "No se ha seleccionado ningún paciente.", variant: "destructive" });
      return;
    }

    const updatedPatient = addMedicalEncounterToPatient(selectedPatient.id, data);

    if (updatedPatient) {
      toast({
        title: "Consulta Guardada",
        description: `Nueva consulta para ${getPatientFullName(selectedPatient)} guardada exitosamente.`,
      });
      setSelectedPatient(updatedPatient); // Actualizar el paciente seleccionado con la nueva consulta
      form.reset();
      // Opcionalmente, redirigir a la página de detalles del paciente:
      // router.push(`/dashboard/patients/${selectedPatient.id}`);
    } else {
      toast({
        title: "Error al Guardar",
        description: "No se pudo guardar la consulta.",
        variant: "destructive",
      });
    }
  };
  
  const calculateAge = (birthDate: string | undefined): string => {
    if (!birthDate) return "N/A";
    try {
        return `${differenceInYears(new Date(), new Date(birthDate))} años`;
    } catch {
        return "N/A";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            <PlusCircle className="mr-3 h-8 w-8 text-primary" />
            Registrar Nueva Consulta Médica
          </CardTitle>
          <CardDescription>
            Busque y seleccione un paciente para añadir una nueva entrada a su historial de consultas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedPatient ? (
            <>
              <FormLabel htmlFor="patientSearch">Buscar Paciente</FormLabel>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  id="patientSearch"
                  placeholder="Buscar por nombre, apellidos o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-grow"
                />
              </div>
              {isLoadingPatient && <p>Cargando paciente...</p>}
              {searchTerm && filteredPatients.length > 0 && (
                <ScrollArea className="h-[200px] border rounded-md">
                  <div className="p-2 space-y-1">
                    {filteredPatients.map(p => (
                      <Button
                        key={p.id}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto py-2"
                        onClick={() => handleSelectPatient(p)}
                      >
                        <div>
                          <p className="font-medium">{getPatientFullName(p)}</p>
                          <p className="text-xs text-muted-foreground">
                            Doc: {p.personalDetails.documentoIdentidad || 'N/A'} - 
                            Nac: {format(new Date(p.personalDetails.fechaNacimiento), "P", { locale: es })}
                          </p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}
              {searchTerm && !filteredPatients.length && !isLoadingPatient && (
                <p className="text-muted-foreground text-center py-4">No se encontraron pacientes.</p>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna de Resumen del Paciente y su Historial */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <User className="mr-2 h-5 w-5 text-primary" />
                      {getPatientFullName(selectedPatient)}
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setSelectedPatient(null)} className="mt-2">
                      <Search className="mr-2 h-4 w-4" /> Cambiar Paciente
                    </Button>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><strong>Documento:</strong> {selectedPatient.personalDetails.documentoIdentidad || 'N/A'}</p>
                    <p><strong>Nacimiento:</strong> {format(new Date(selectedPatient.personalDetails.fechaNacimiento), "PPP", { locale: es })} ({calculateAge(selectedPatient.personalDetails.fechaNacimiento)})</p>
                    <p><strong>Móvil:</strong> {selectedPatient.personalDetails.telefono1 || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedPatient.personalDetails.email || 'N/A'}</p>
                    <Button variant="link" asChild className="p-0 h-auto text-sm">
                        <Link href={`/dashboard/patients/${selectedPatient.id}`}>Ver historial completo</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <History className="mr-2 h-5 w-5 text-primary" />
                      Historial de Consultas Recientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPatient.medicalEncounters && selectedPatient.medicalEncounters.length > 0 ? (
                      <ScrollArea className="h-[300px] pr-3">
                        <ul className="space-y-3">
                          {[...selectedPatient.medicalEncounters].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0,5).map(enc => ( // Mostrar últimas 5
                            <li key={enc.id} className="text-xs border-b pb-2 mb-2">
                              <p className="font-semibold">{format(new Date(enc.date), "PPP, p", { locale: es })}</p>
                              <p className="text-muted-foreground truncate whitespace-normal line-clamp-3">{enc.details.split('\n\n')[0]}</p> {/* Muestra la primera sección (Anamnesis) */}
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay consultas previas registradas.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Columna del Formulario de Nueva Consulta */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <FileText className="mr-2 h-5 w-5 text-primary" />
                      Detalles de la Nueva Consulta
                    </CardTitle>
                    <CardDescription>Fecha de hoy: {format(new Date(), "PPP", { locale: es })}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="anamnesis"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center"><ListChecks className="mr-2 h-4 w-4 text-primary" />Anamnesis</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Motivo de consulta, enfermedad actual, antecedentes relevantes..." rows={4} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="exploracionFisica"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center"><StethoscopeIcon className="mr-2 h-4 w-4 text-primary" />Exploración Física</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Signos vitales, examen por sistemas..." rows={4} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="estudiosComplementarios"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center"><Microscope className="mr-2 h-4 w-4 text-primary" />Estudios Complementarios (Opcional)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Resultados de laboratorio, imágenes, etc." rows={3} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="impresionDiagnostica"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center"><Brain className="mr-2 h-4 w-4 text-primary" />Impresión Diagnóstica</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Diagnóstico(s) presuntivo(s) o definitivos..." rows={3} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="plan"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center"><Activity className="mr-2 h-4 w-4 text-primary" />Plan de Tratamiento y Seguimiento</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Indicaciones, recetas, recomendaciones, próxima cita..." rows={4} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <CardFooter className="px-0 pt-6">
                          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
                            {form.formState.isSubmitting ? "Guardando..." : "Guardar Consulta"}
                          </Button>
                        </CardFooter>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
