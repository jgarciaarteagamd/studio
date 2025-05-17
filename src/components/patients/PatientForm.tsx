// src/components/patients/PatientForm.tsx
"use client";

import type React from 'react';
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { PersonalDetails, BackgroundInformation, PatientRecord } from "@/lib/types"; // Updated types
import { CalendarIcon, UserCircle, Phone, ClipboardList, AlertTriangle, Pill } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";

// Define Zod schema for validation for PersonalDetails and BackgroundInformation
const patientFormSchema = z.object({
  personalDetails: z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
    dateOfBirth: z.date({ required_error: "La fecha de nacimiento es obligatoria." }),
    contactInfo: z.string().min(5, "La información de contacto parece demasiado corta."),
  }),
  backgroundInformation: z.object({
    personalHistory: z.string().optional(),
    allergies: z.string().optional(),
    habitualMedication: z.string().optional(),
  }),
});

// This type represents the values the form will manage
type PatientFormValues = z.infer<typeof patientFormSchema>;

// The onSubmit prop will receive data structured according to PatientFormValues
interface PatientFormProps {
  onSubmit: (data: PatientFormValues) => void;
  initialData?: Partial<Pick<PatientRecord, 'personalDetails' | 'backgroundInformation'>>;
  submitButtonText?: string;
}

export function PatientForm({ onSubmit, initialData, submitButtonText = "Guardar Paciente" }: PatientFormProps) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      personalDetails: {
        name: initialData?.personalDetails?.name || "",
        dateOfBirth: initialData?.personalDetails?.dateOfBirth ? new Date(initialData.personalDetails.dateOfBirth) : undefined,
        contactInfo: initialData?.personalDetails?.contactInfo || "",
      },
      backgroundInformation: {
        personalHistory: initialData?.backgroundInformation?.personalHistory || "",
        allergies: initialData?.backgroundInformation?.allergies || "",
        habitualMedication: initialData?.backgroundInformation?.habitualMedication || "",
      },
    },
  });

  const handleFormSubmit: SubmitHandler<PatientFormValues> = (data) => {
    // The date is already a Date object from the form, convert to ISO string if needed by the caller
    // For this form, we pass it as is, according to PatientFormValues.
    // The calling component will handle the full PatientRecord structure.
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <section className="space-y-6 p-4 border rounded-lg shadow">
          <h3 className="text-xl font-semibold flex items-center"><UserCircle className="mr-2 h-6 w-6 text-primary" /> Datos Personales</h3>
          <FormField
            control={form.control}
            name="personalDetails.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: María González Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="personalDetails.dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Nacimiento</FormLabel>
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
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="personalDetails.contactInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Phone className="mr-2 h-4 w-4 text-primary" /> Información de Contacto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: email@example.com | 555-1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>
        
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>
        
        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
