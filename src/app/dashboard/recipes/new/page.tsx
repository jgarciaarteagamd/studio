
// src/app/dashboard/recipes/new/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, type SubmitHandler, Controller } from 'react-hook-form';
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
import { mockPatients, getPatientById, addRecipeToPatient, getPatientFullName, type PatientRecord, type Recipe, type MedicationItem, calculateAge } from '@/lib/mock-data';
import { User, FileText, History, PlusCircle, Search, ListChecks, Pill, ShieldAlert, ClipboardEdit, Trash2, Printer, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

const medicationItemSchema = z.object({
  id: z.string().optional(), // For react-hook-form field array key
  drugName: z.string().min(1, "El nombre del fármaco es obligatorio."),
  presentation: z.string().min(1, "La presentación es obligatoria."),
  indications: z.string().min(1, "Las indicaciones son obligatorias."),
});

const recipeFormSchema = z.object({
  medications: z.array(medicationItemSchema).min(1, "Debe agregar al menos un medicamento."),
  preventiveMeasures: z.string().min(1, "Las medidas de prevención y cuidados son obligatorias."),
  diagnoses: z.string().optional(),
  observations: z.string().optional(),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

const ITEMS_PER_RECIPE_HISTORY_PAGE = 3;

export default function NewRecipePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [allPatients, setAllPatients] = useState<PatientRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('es-ES');
  const [currentRecipeHistoryPage, setCurrentRecipeHistoryPage] = useState(1);

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

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      medications: [{ drugName: '', presentation: '', indications: '' }],
      preventiveMeasures: '',
      diagnoses: '',
      observations: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medications",
  });

  const handleSelectPatient = (patient: PatientRecord) => {
    setIsLoadingPatient(true);
    setTimeout(() => {
      setSelectedPatient(patient);
      setSearchTerm('');
      setIsLoadingPatient(false);
      setCurrentRecipeHistoryPage(1); // Reset pagination for new patient
      form.reset({ 
        medications: [{ drugName: '', presentation: '', indications: '' }],
        preventiveMeasures: '',
        diagnoses: '',
        observations: '',
      });
    }, 300);
  };

  const onSubmit: SubmitHandler<RecipeFormValues> = async (data) => {
    if (!selectedPatient) {
      toast({ title: "Error", description: "No se ha seleccionado ningún paciente.", variant: "destructive" });
      return;
    }

    const recipeDataToSave = {
      medications: data.medications.map(med => ({...med, id: `med-${Date.now()}-${Math.random()}`})),
      preventiveMeasures: data.preventiveMeasures,
      diagnoses: data.diagnoses,
      observations: data.observations,
    };

    const updatedPatient = addRecipeToPatient(selectedPatient.id, recipeDataToSave);

    if (updatedPatient) {
      toast({
        title: "Receta Guardada",
        description: `Nueva receta para ${getPatientFullName(updatedPatient)} guardada exitosamente.`,
      });
      setSelectedPatient(updatedPatient); // Actualizar paciente para reflejar nueva receta en historial
      setCurrentRecipeHistoryPage(1); // Volver a la primera página del historial
      form.reset({ 
        medications: [{ drugName: '', presentation: '', indications: '' }],
        preventiveMeasures: '',
        diagnoses: '',
        observations: '',
      });
    } else {
      toast({
        title: "Error al Guardar",
        description: "No se pudo guardar la receta.",
        variant: "destructive",
      });
    }
  };
  
  const handleGeneratePdf = () => {
    if (!selectedPatient || form.getValues('medications').length === 0) {
      toast({ title: "Información Incompleta", description: "Seleccione un paciente y agregue al menos un medicamento.", variant: "destructive" });
      return;
    }
    const formData = form.getValues();
    let pdfContent = `== RECETA ==\n\n`;
    pdfContent += `Paciente: ${getPatientFullName(selectedPatient)}\n`;
    pdfContent += `Fecha: ${format(new Date(), "PPP", { locale: es })}\n\n`;
    if (formData.diagnoses) {
      pdfContent += `Diagnóstico(s):\n${formData.diagnoses}\n\n`;
    }
    pdfContent += `Medicación:\n`;
    formData.medications.forEach((med, index) => {
      pdfContent += `${index + 1}. ${med.drugName} (${med.presentation})\n   Indicaciones: ${med.indications}\n`;
    });
    pdfContent += `\nMedidas de Prevención y Cuidados:\n${formData.preventiveMeasures}\n\n`;
    if (formData.observations) {
      pdfContent += `Observaciones:\n${formData.observations}\n\n`;
    }
    pdfContent += `\n\nFirma del Médico:\n_________________________`;
    
    alert("Generación de PDF (simulada):\n\n" + pdfContent);
    console.log("Datos para PDF:", {patient: selectedPatient, recipe: formData});
  };

  const handleDownloadSpecificRecipe = (recipe: Recipe) => {
    if (!selectedPatient) return;
    let pdfContent = `== RECETA ==\n\n`;
    pdfContent += `Paciente: ${getPatientFullName(selectedPatient)}\n`;
    pdfContent += `Fecha: ${format(new Date(recipe.date), "PPP", { locale: es })}\n\n`;
    if (recipe.diagnoses) {
      pdfContent += `Diagnóstico(s):\n${recipe.diagnoses}\n\n`;
    }
    pdfContent += `Medicación:\n`;
    recipe.medications.forEach((med, index) => {
      pdfContent += `${index + 1}. ${med.drugName} (${med.presentation})\n   Indicaciones: ${med.indications}\n`;
    });
    pdfContent += `\nMedidas de Prevención y Cuidados:\n${recipe.preventiveMeasures}\n\n`;
    if (recipe.observations) {
      pdfContent += `Observaciones:\n${recipe.observations}\n\n`;
    }
    pdfContent += `\n\nFirma del Médico:\n_________________________`;
    alert("Descarga de Receta Específica (simulada):\n\n" + pdfContent);
  };

  const sortedRecipeHistory = useMemo(() => {
    if (!selectedPatient || !selectedPatient.recipes) return [];
    return [...selectedPatient.recipes].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedPatient]);

  const totalRecipeHistoryPages = Math.ceil(sortedRecipeHistory.length / ITEMS_PER_RECIPE_HISTORY_PAGE);

  const paginatedRecipeHistory = useMemo(() => {
    const startIndex = (currentRecipeHistoryPage - 1) * ITEMS_PER_RECIPE_HISTORY_PAGE;
    return sortedRecipeHistory.slice(startIndex, startIndex + ITEMS_PER_RECIPE_HISTORY_PAGE);
  }, [sortedRecipeHistory, currentRecipeHistoryPage]);

  const handleNextRecipePage = () => {
    if (currentRecipeHistoryPage < totalRecipeHistoryPages) {
      setCurrentRecipeHistoryPage(currentRecipeHistoryPage + 1);
    }
  };

  const handlePreviousRecipePage = () => {
    if (currentRecipeHistoryPage > 1) {
      setCurrentRecipeHistoryPage(currentRecipeHistoryPage - 1);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            <PlusCircle className="mr-3 h-8 w-8 text-primary" />
            Crear Nueva Receta
          </CardTitle>
          <CardDescription>
            Busque y seleccione un paciente para crear una nueva receta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedPatient ? (
            <>
              <Label htmlFor="patientSearchRecipe" className="mb-2 block">Buscar Paciente</Label>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  id="patientSearchRecipe"
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                 <div className="mb-4">
                    <Button variant="outline" size="sm" onClick={() => setSelectedPatient(null)} className="w-full sm:w-auto">
                        <Search className="mr-2 h-4 w-4" /> Cambiar Paciente
                    </Button>
                </div>
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
                     <Button variant="link" asChild className="p-0 h-auto text-sm">
                        <Link href={`/dashboard/patients/${selectedPatient.id}`}>Ver historial completo del paciente</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <History className="mr-2 h-5 w-5 text-primary" />
                      Historial de Recetas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {paginatedRecipeHistory.length > 0 ? (
                      <>
                        <ScrollArea className="pr-3">
                          <ul className="space-y-3">
                            {paginatedRecipeHistory.map(recipe => (
                              <li key={recipe.id} className="text-xs border-b pb-2 mb-2">
                                <div className="flex justify-between items-center">
                                  <p className="font-semibold">{format(new Date(recipe.date), "PPP", { locale: es })}</p>
                                  <Button variant="outline" size="icon" className="h-7 w-7" title="Descargar Receta (Simulado)" onClick={() => handleDownloadSpecificRecipe(recipe)}>
                                      <Download className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-muted-foreground truncate whitespace-normal line-clamp-2 mt-1">
                                  {recipe.medications.map(m => m.drugName).join(', ') || 'Receta sin medicamentos especificados'}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                        {totalRecipeHistoryPages > 1 && (
                          <div className="flex items-center justify-between pt-4 mt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handlePreviousRecipePage}
                              disabled={currentRecipeHistoryPage === 1}
                            >
                              <ChevronLeft className="mr-1 h-4 w-4" />
                              Anterior
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              Página {currentRecipeHistoryPage} de {totalRecipeHistoryPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleNextRecipePage}
                              disabled={currentRecipeHistoryPage === totalRecipeHistoryPages}
                            >
                              Siguiente
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay recetas previas.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <ClipboardEdit className="mr-2 h-5 w-5 text-primary" />
                      Detalles de la Nueva Receta
                    </CardTitle>
                    <CardDescription>Fecha de hoy: {format(new Date(), "PPP", { locale: es })}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                          <FormLabel className="flex items-center text-lg mb-2"><Pill className="mr-2 h-5 w-5 text-primary" />Medicación</FormLabel>
                          {fields.map((field, index) => (
                            <Card key={field.id} className="w-full mb-4 p-4 relative shadow-sm border">
                              <FormField
                                control={form.control}
                                name={`medications.${index}.drugName`}
                                render={({ field }) => (
                                  <FormItem className="w-full">
                                    <FormLabel>Nombre del Fármaco</FormLabel>
                                    <FormControl><Input placeholder="Ej: Amoxicilina 500mg" {...field} className="w-full" /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`medications.${index}.presentation`}
                                render={({ field }) => (
                                  <FormItem className="w-full mt-3">
                                    <FormLabel>Presentación</FormLabel>
                                    <FormControl><Input placeholder="Ej: Comprimidos, Jarabe 125mg/5ml" {...field} className="w-full" /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`medications.${index}.indications`}
                                render={({ field }) => (
                                  <FormItem className="w-full mt-3">
                                    <FormLabel>Indicaciones (Dosis, frecuencia, duración)</FormLabel>
                                    <FormControl><Textarea placeholder="Ej: Tomar 1 comprimido cada 8 horas por 7 días." rows={2} {...field} className="w-full" /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              {fields.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="absolute top-3 right-3 text-destructive hover:bg-destructive/10 h-7 w-7">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </Card>
                          ))}
                          <Button type="button" variant="outline" size="sm" onClick={() => append({ drugName: '', presentation: '', indications: '' })} className="mt-2 w-full">
                            <PlusCircle className="mr-2 h-4 w-4" /> Agregar Otro Medicamento
                          </Button>
                        </div>

                        <FormField
                          control={form.control}
                          name="preventiveMeasures"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center"><ShieldAlert className="mr-2 h-4 w-4 text-primary" />Medidas de Prevención y Cuidados</FormLabel>
                              <FormControl><Textarea placeholder="Ej: Reposo, dieta blanda, control de temperatura..." rows={3} {...field} className="w-full" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Separator />
                        <p className="text-sm text-muted-foreground pt-2">Campos opcionales para PDF:</p>
                         <FormField
                          control={form.control}
                          name="diagnoses"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Diagnóstico(s) (Opcional para PDF)</FormLabel>
                              <FormControl><Textarea placeholder="Ej: Faringoamigdalitis Aguda, Infección Urinaria..." rows={2} {...field} className="w-full" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="observations"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observaciones (Opcional para PDF)</FormLabel>
                              <FormControl><Textarea placeholder="Ej: Paciente refiere alergia a AINES. Próximo control en 7 días." rows={2} {...field} className="w-full" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <CardFooter className="px-0 pt-6 flex flex-col sm:flex-row gap-4 justify-between">
                          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
                            {form.formState.isSubmitting ? "Guardando..." : "Guardar Receta"}
                          </Button>
                          <Button type="button" variant="outline" onClick={handleGeneratePdf} className="w-full sm:w-auto">
                            <Printer className="mr-2 h-4 w-4" /> Generar PDF (Simulado)
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
