
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { mockPatients, getPatientById, addMedicalEncounterToPatient, getPatientFullName, type NewConsultationData, calculateAge } from '@/lib/mock-data';
import type { PatientRecord, MedicalEncounter } from '@/lib/types';
import { User, FileText, History, PlusCircle, Search, ListChecks, Activity, Microscope, Stethoscope as StethoscopeIcon, Brain, Printer, Download, ClipboardList, FileEdit as FileEditIcon, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
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
    setAllPatients(mockPatients);
  }, []);

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return [];
    return allPatients.filter(patient => {
      const fullName = `${patient.personalDetails.nombres} ${patient.personalDetails.apellidos}`.toLowerCase();
      const doc = patient.personalDetails.documentoIdentidad?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return fullName.includes(term) || doc.includes(term);
    }).slice(0, 5);
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
    // Simular carga
    setTimeout(() => {
      setSelectedPatient(patient);
      setSearchTerm('');
      setIsLoadingPatient(false);
      form.reset();
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
        description: `Nueva consulta para ${getPatientFullName(updatedPatient)} guardada exitosamente.`,
      });
      setSelectedPatient(updatedPatient);
      form.reset();
    } else {
      toast({
        title: "Error al Guardar",
        description: "No se pudo guardar la consulta.",
        variant: "destructive",
      });
    }
  };


  const handleGenerateConsultationPdf = () => {
    if (!selectedPatient) {
      toast({ title: "Paciente no seleccionado", description: "Por favor, seleccione un paciente primero.", variant: "destructive" });
      return;
    }
    const formData = form.getValues();
    if (!formData.anamnesis && !formData.exploracionFisica && !formData.impresionDiagnostica && !formData.plan) {
      toast({ title: "Formulario Vacío", description: "Por favor, complete al menos algunos campos de la consulta para generar el PDF.", variant: "default" });
      return;
    }

    let pdfContent = `== CONSULTA MÉDICA ==\n\n`;
    pdfContent += `Paciente: ${getPatientFullName(selectedPatient)}\n`;
    pdfContent += `Fecha: ${format(new Date(), "PPP", { locale: es })}\n\n`;
    pdfContent += `Anamnesis:\n${formData.anamnesis || 'No registrado.'}\n\n`;
    pdfContent += `Exploración Física:\n${formData.exploracionFisica || 'No registrado.'}\n\n`;
    pdfContent += `Estudios Complementarios:\n${formData.estudiosComplementarios || 'No registrado.'}\n\n`;
    pdfContent += `Impresión Diagnóstica:\n${formData.impresionDiagnostica || 'No registrado.'}\n\n`;
    pdfContent += `Plan:\n${formData.plan || 'No registrado.'}\n\n`;
    pdfContent += `\n\nFirma del Médico:\n_________________________`;

    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const safePatientName = getPatientFullName(selectedPatient).replace(/\s+/g, '_');
    link.download = `Consulta_${safePatientName}_${new Date().toISOString().split('T')[0]}.pdf`;
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    toast({
      title: "Descarga de Consulta (Simulada)",
      description: `El PDF de la consulta para ${getPatientFullName(selectedPatient)} se está descargando.`,
    });
  };

  const handleDownloadSpecificConsultationPdf = (encounter: MedicalEncounter) => {
    if (!selectedPatient) return;
    let pdfContent = `== CONSULTA MÉDICA ==\n\n`;
    pdfContent += `Paciente: ${getPatientFullName(selectedPatient)}\n`;
    pdfContent += `Fecha de Consulta: ${format(new Date(encounter.date), "PPP", { locale: es })}\n\n`;
    pdfContent += `Detalles de la Consulta:\n${encounter.details}\n\n`;
    pdfContent += `\n\nFirma del Médico:\n_________________________`;

    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const encounterDateFormatted = format(new Date(encounter.date), "yyyy-MM-dd");
    const safePatientName = getPatientFullName(selectedPatient).replace(/\s+/g, '_');
    link.download = `Consulta_${safePatientName}_${encounterDateFormatted}.pdf`;
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    toast({
      title: "Descarga de Consulta (Simulada)",
      description: `El PDF de la consulta de ${format(new Date(encounter.date), "P", { locale: es })} se está descargando.`,
    });
  };

  const recentEncounters = useMemo(() => {
    if (!selectedPatient || !selectedPatient.medicalEncounters) return [];
    return [...selectedPatient.medicalEncounters]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [selectedPatient]);


  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <PlusCircle className="mr-1 h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Nueva Consulta</CardTitle>
          </div>
          
        </CardHeader>
        <CardContent className="space-y-6">
          {!selectedPatient ? (
            <>
              <div className="flex items-center space-x-2">
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
                            Edad: {calculateAge(p.personalDetails.fechaNacimiento)}
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
            <>
              <div className="mb-4">
                <Button variant="outline" size="sm" onClick={() => setSelectedPatient(null)} className="w-full sm:w-auto">
                  <Search className="mr-2 h-4 w-4" /> Cambiar Paciente
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-xl">
                        <User className="mr-2 h-5 w-5 text-primary" />
                        {getPatientFullName(selectedPatient)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p><strong>Documento:</strong> {selectedPatient.personalDetails.documentoIdentidad || 'N/A'}</p>
                      <p><strong>Edad:</strong> {calculateAge(selectedPatient.personalDetails.fechaNacimiento)}</p>
                      <p><strong>Móvil:</strong> {selectedPatient.personalDetails.telefono1 || 'N/A'}</p>
                      <p><strong>Email:</strong> {selectedPatient.personalDetails.email || 'N/A'}</p>
                      <Button variant="link" asChild className="p-0 h-auto text-sm">
                        <Link href={`/dashboard/patients/${selectedPatient.id}`}>Ver historial completo</Link>
                      </Button>
                    </CardContent>
                  </Card>

                   {selectedPatient.backgroundInformation && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <ClipboardList className="mr-2 h-5 w-5 text-primary" />
                          Antecedentes del Paciente
                        </CardTitle>
                         <Button variant="outline" size="sm" asChild className="mt-2 text-xs">
                          <Link href={`/dashboard/patients/${selectedPatient.id}?tab=backgroundInfo`}>
                            <Edit3 className="mr-2 h-3 w-3" /> Modificar Antecedentes
                          </Link>
                        </Button>
                      </CardHeader>
                      <CardContent className="text-xs space-y-2">
                        <div>
                          <p className="font-semibold">Antecedentes Personales:</p>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {selectedPatient.backgroundInformation.personalHistory || "No registrados"}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold">Alergias:</p>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {selectedPatient.backgroundInformation.allergies || "No registradas"}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold">Medicación Habitual:</p>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {selectedPatient.backgroundInformation.habitualMedication || "No registrada"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}


                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <History className="mr-2 h-5 w-5 text-primary" />
                        Historial de Consultas Recientes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentEncounters.length > 0 ? (
                        <ScrollArea className="pr-3">
                          <ul className="space-y-3">
                            {recentEncounters.map((enc, index) => (
                              <li key={enc.id} className="text-xs border-b pb-2 mb-2">
                                <div className="flex justify-between items-center">
                                  <p className="font-semibold">{format(new Date(enc.date), "PPP, p", { locale: es })}</p>
                                  <Button variant="outline" size="icon" className="h-7 w-7" title="Descargar Consulta (Simulado)" onClick={() => handleDownloadSpecificConsultationPdf(enc)}>
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </div>
                                {index === 0 ? (
                                  <p className="text-muted-foreground whitespace-pre-wrap mt-1">{enc.details}</p>
                                ) : (
                                  <p className="text-muted-foreground truncate whitespace-normal line-clamp-3 hover:line-clamp-none transition-all duration-300 ease-in-out mt-1">
                                    {enc.details.split('\n\n')[0]}
                                  </p>
                                )}
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
                          <CardFooter className="px-0 pt-6 flex flex-col sm:flex-row gap-4 justify-between">
                            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
                              {form.formState.isSubmitting ? "Guardando..." : "Guardar Consulta"}
                            </Button>
                            <Button type="button" variant="outline" onClick={handleGenerateConsultationPdf} className="w-full sm:w-auto">
                              <Printer className="mr-2 h-4 w-4" /> Generar PDF (Simulado)
                            </Button>
                          </CardFooter>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
