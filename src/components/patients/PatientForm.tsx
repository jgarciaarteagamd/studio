
// src/components/patients/PatientForm.tsx
"use client";

import type React from 'react';
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { PersonalDetails, BackgroundInformation, PatientRecord, DatosFacturacion } from "@/lib/types"; 
import { CalendarIcon, UserCircle, Phone, ClipboardList, AlertTriangle, Pill, FileTextIcon, Building, Briefcase } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, differenceInYears } from "date-fns";
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";

const personalDetailsSchema = z.object({
  nombres: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  apellidos: z.string().min(2, "Los apellidos deben tener al menos 2 caracteres."),
  documentoIdentidad: z.string().optional().nullable(),
  fechaNacimiento: z.date({ required_error: "La fecha de nacimiento es obligatoria." }),
  telefono1: z.string().optional().nullable(),
  telefono2: z.string().optional().nullable(),
  email: z.string().email("Formato de correo electrónico inválido.").optional().nullable(),
});

const datosFacturacionSchema = z.object({
  ruc: z.string().optional().nullable(),
  direccionFiscal: z.string().optional().nullable(),
  telefonoFacturacion: z.string().optional().nullable(),
  emailFacturacion: z.string().email("Formato de correo inválido.").optional().nullable(),
}).optional().nullable();

const backgroundInformationSchema = z.object({
  personalHistory: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  habitualMedication: z.string().optional().nullable(),
}).optional().nullable();

const patientFormSchema = z.object({
  personalDetails: personalDetailsSchema,
  datosFacturacion: datosFacturacionSchema,
  backgroundInformation: backgroundInformationSchema,
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  onSubmit: (data: PatientFormValues) => void;
  initialData?: Partial<Pick<PatientRecord, 'personalDetails' | 'backgroundInformation' | 'datosFacturacion'>>;
  submitButtonText?: string;
  allowEditBackgroundInfo?: boolean; // Controls editability of background info
  allowEditFacturacionInfo?: boolean; // Controls editability of billing info
  showPersonalDetailsSection?: boolean; // Controls visibility of personal details section
  showDatosFacturacionSection?: boolean; // Controls visibility of billing section
  showBackgroundInformationSection?: boolean; // Controls visibility of background info section
}

export function PatientForm({ 
  onSubmit, 
  initialData, 
  submitButtonText = "Guardar Paciente",
  allowEditBackgroundInfo = true,
  allowEditFacturacionInfo = true,
  showPersonalDetailsSection = true,
  showDatosFacturacionSection = true,
  showBackgroundInformationSection = true,
}: PatientFormProps) {
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      personalDetails: {
        nombres: initialData?.personalDetails?.nombres || "",
        apellidos: initialData?.personalDetails?.apellidos || "",
        documentoIdentidad: initialData?.personalDetails?.documentoIdentidad || "",
        fechaNacimiento: initialData?.personalDetails?.fechaNacimiento ? new Date(initialData.personalDetails.fechaNacimiento) : undefined,
        telefono1: initialData?.personalDetails?.telefono1 || "",
        telefono2: initialData?.personalDetails?.telefono2 || "",
        email: initialData?.personalDetails?.email || "",
      },
      datosFacturacion: {
        ruc: initialData?.datosFacturacion?.ruc || "",
        direccionFiscal: initialData?.datosFacturacion?.direccionFiscal || "",
        telefonoFacturacion: initialData?.datosFacturacion?.telefonoFacturacion || "",
        emailFacturacion: initialData?.datosFacturacion?.emailFacturacion || "",
      },
      backgroundInformation: {
        personalHistory: initialData?.backgroundInformation?.personalHistory || "",
        allergies: initialData?.backgroundInformation?.allergies || "",
        habitualMedication: initialData?.backgroundInformation?.habitualMedication || "",
      },
    },
  });

  const dateOfBirthWatcher = form.watch("personalDetails.fechaNacimiento");

  useEffect(() => {
    if (dateOfBirthWatcher) {
      setCalculatedAge(differenceInYears(new Date(), dateOfBirthWatcher));
    } else {
      setCalculatedAge(null);
    }
  }, [dateOfBirthWatcher]);

  const handleFormSubmit: SubmitHandler<PatientFormValues> = (data) => {
    // Only include data from sections that are meant to be shown/edited by this form instance
    const dataToSubmit: Partial<PatientFormValues> = {};
    if (showPersonalDetailsSection) {
        dataToSubmit.personalDetails = data.personalDetails;
    }
    if (showDatosFacturacionSection) {
        dataToSubmit.datosFacturacion = allowEditFacturacionInfo ? data.datosFacturacion : initialData?.datosFacturacion || undefined;
    }
    if (showBackgroundInformationSection) {
        dataToSubmit.backgroundInformation = allowEditBackgroundInfo ? data.backgroundInformation : initialData?.backgroundInformation || undefined;
    }
    onSubmit(dataToSubmit as PatientFormValues); // Cast as PatientFormValues, assuming all parts are present or optional
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        
        {showPersonalDetailsSection && (
          <>
            <section className="space-y-6 p-4 border rounded-lg shadow">
              <h3 className="text-xl font-semibold flex items-center"><UserCircle className="mr-2 h-6 w-6 text-primary" /> Datos Personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="personalDetails.nombres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombres</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: María" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="personalDetails.apellidos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellidos</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: González Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="personalDetails.documentoIdentidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><FileTextIcon className="mr-2 h-4 w-4 text-primary" /> Documento de Identidad</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 1712345678 (Cédula en Ecuador)" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <FormField
                  control={form.control}
                  name="personalDetails.fechaNacimiento"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Nacimiento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Seleccione una fecha</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            locale={es}
                            captionLayout="dropdown-buttons"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Edad</FormLabel>
                  <Input
                    value={calculatedAge !== null ? `${calculatedAge} años` : "N/A"}
                    readOnly
                    className="bg-muted/50"
                  />
                </FormItem>
              </div>
            </section>

            <section className="space-y-6 p-4 border rounded-lg shadow">
              <h3 className="text-xl font-semibold flex items-center"><Phone className="mr-2 h-6 w-6 text-primary" /> Datos de Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="personalDetails.telefono1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono móvil</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Ej: 0987654321" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="personalDetails.telefono2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono opcional</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Ej: 025551234" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="personalDetails.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Ej: paciente@example.com" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
          </>
        )}
        
        {showDatosFacturacionSection && (
            <section className={cn("space-y-6 p-4 border rounded-lg shadow", !allowEditFacturacionInfo && "opacity-60")}>
            <h3 className="text-xl font-semibold flex items-center"><Briefcase className="mr-2 h-6 w-6 text-primary" /> Datos de Facturación</h3>
            <FormField
                control={form.control}
                name="datosFacturacion.ruc"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Registro Único de Contribuyente (RUC)</FormLabel>
                    <FormControl>
                    <Input placeholder="Ej: 1712345678001 (Ecuador)" {...field} value={field.value || ''} disabled={!allowEditFacturacionInfo} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="datosFacturacion.direccionFiscal"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Dirección Fiscal</FormLabel>
                    <FormControl>
                    <Input placeholder="Ej: Av. Principal 123, Ciudad" {...field} value={field.value || ''} disabled={!allowEditFacturacionInfo} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="datosFacturacion.telefonoFacturacion"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Teléfono de Facturación</FormLabel>
                    <FormControl>
                        <Input type="tel" placeholder="Ej: 0999888777" {...field} value={field.value || ''} disabled={!allowEditFacturacionInfo} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="datosFacturacion.emailFacturacion"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Correo de Facturación</FormLabel>
                    <FormControl>
                        <Input type="email" placeholder="Ej: facturacion@example.com" {...field} value={field.value || ''} disabled={!allowEditFacturacionInfo} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            {!allowEditFacturacionInfo && initialData?.datosFacturacion && (initialData.datosFacturacion.ruc || initialData.datosFacturacion.direccionFiscal) && <FormDescription>Solo el personal médico puede editar esta sección.</FormDescription>}
            </section>
        )}
        
        {showBackgroundInformationSection && (
            <>
                {allowEditBackgroundInfo ? (
                    <section className="space-y-6 p-4 border rounded-lg shadow">
                        <h3 className="text-xl font-semibold flex items-center"><ClipboardList className="mr-2 h-6 w-6 text-primary" /> Antecedentes y Medicación</h3>
                        <FormField
                            control={form.control}
                            name="backgroundInformation.personalHistory"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center"><ClipboardList className="mr-2 h-5 w-5 text-primary" /> Antecedentes Personales Relevantes</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="Detalle enfermedades previas, cirugías, hospitalizaciones, hábitos (tabaco, alcohol, etc.), antecedentes familiares importantes..."
                                    className="min-h-[100px]"
                                    {...field}
                                    value={field.value || ''}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="backgroundInformation.allergies"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center"><AlertTriangle className="mr-2 h-5 w-5 text-primary" /> Alergias Conocidas</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="Liste alergias a medicamentos, alimentos u otras sustancias y el tipo de reacción..."
                                    className="min-h-[80px]"
                                    {...field}
                                    value={field.value || ''}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="backgroundInformation.habitualMedication"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center"><Pill className="mr-2 h-5 w-5 text-primary" /> Medicación Habitual</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="Liste los medicamentos que el paciente toma regularmente, incluyendo dosis y frecuencia..."
                                    className="min-h-[100px]"
                                    {...field}
                                    value={field.value || ''}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </section>
                ) : (
                    initialData?.backgroundInformation && (initialData.backgroundInformation.personalHistory || initialData.backgroundInformation.allergies || initialData.backgroundInformation.habitualMedication) && (
                        <section className="space-y-4 p-4 border rounded-lg shadow bg-muted/30">
                            <h3 className="text-xl font-semibold flex items-center"><ClipboardList className="mr-2 h-6 w-6 text-primary" /> Antecedentes y Medicación (Solo lectura)</h3>
                            <div>
                            <FormLabel className="flex items-center text-sm"><ClipboardList className="mr-2 h-5 w-5 text-primary/80" /> Antecedentes Personales Relevantes</FormLabel>
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{initialData.backgroundInformation.personalHistory || "No registrado"}</p>
                            </div>
                            <div>
                            <FormLabel className="flex items-center text-sm"><AlertTriangle className="mr-2 h-5 w-5 text-primary/80" /> Alergias Conocidas</FormLabel>
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{initialData.backgroundInformation.allergies || "No registrado"}</p>
                            </div>
                            <div>
                            <FormLabel className="flex items-center text-sm"><Pill className="mr-2 h-5 w-5 text-primary/80" /> Medicación Habitual</FormLabel>
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{initialData.backgroundInformation.habitualMedication || "No registrado"}</p>
                            </div>
                        </section>
                    )
                )}
            </>
        )}
        
        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
