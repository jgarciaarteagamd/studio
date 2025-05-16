// src/components/patients/PatientForm.tsx
"use client";

import type React from 'react';
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { PatientRecord } from "@/lib/types";
import { CalendarIcon,ClipboardList, Stethoscope, NotebookText } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from 'date-fns/locale'; // Import Spanish locale for date-fns
import { cn } from "@/lib/utils";

// Define Zod schema for validation
const patientFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  dateOfBirth: z.date({ required_error: "La fecha de nacimiento es obligatoria." }),
  contactInfo: z.string().min(5, "La información de contacto parece demasiado corta."),
  medicalHistory: z.string().optional(),
  examinationResults: z.string().optional(),
  treatmentPlans: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  onSubmit: (data: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt' | 'attachments'>) => void;
  initialData?: Partial<PatientRecord>;
  submitButtonText?: string;
}

export function PatientForm({ onSubmit, initialData, submitButtonText = "Guardar Paciente" }: PatientFormProps) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined,
      contactInfo: initialData?.contactInfo || "",
      medicalHistory: initialData?.medicalHistory || "",
      examinationResults: initialData?.examinationResults || "",
      treatmentPlans: initialData?.treatmentPlans || "",
    },
  });

  const handleFormSubmit: SubmitHandler<PatientFormValues> = (data) => {
    const dataToSubmit = {
      ...data,
      dateOfBirth: data.dateOfBirth.toISOString(), // Convert date back to string for submission
      // attachments are handled separately
    };
    onSubmit(dataToSubmit);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: María González" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="dateOfBirth"
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
                          format(field.value, "PPP", { locale: es }) // Use Spanish locale
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
                      locale={es} // Use Spanish locale for Calendar
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Información de Contacto</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: email@example.com | 555-1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="medicalHistory"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><ClipboardList className="mr-2 h-5 w-5 text-primary" /> Historial Médico</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalle enfermedades pasadas, cirugías, alergias, medicamentos, antecedentes familiares..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="examinationResults"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><Stethoscope className="mr-2 h-5 w-5 text-primary" /> Resultados del Examen</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Registre hallazgos de exámenes físicos, pruebas de laboratorio, estudios de imagen..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="treatmentPlans"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><NotebookText className="mr-2 h-5 w-5 text-primary" /> Planes de Tratamiento</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describa prescripciones de medicamentos, recomendaciones de estilo de vida, derivaciones, programas de seguimiento..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
