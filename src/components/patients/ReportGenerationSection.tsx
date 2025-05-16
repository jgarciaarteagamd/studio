// src/components/patients/ReportGenerationSection.tsx
"use client";

import type React from 'react';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, ExternalLink } from "lucide-react";
import type { PatientRecord } from "@/lib/types";
import { summarizeRecord, generateReport } from "@/ai/flows"; 
import { useToast } from "@/hooks/use-toast";

interface ReportGenerationSectionProps {
  patient: PatientRecord;
}

export function ReportGenerationSection({ patient }: ReportGenerationSectionProps) {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingFullReport, setIsGeneratingFullReport] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const { toast } = useToast();
  const [currentLocale, setCurrentLocale] = useState('es-ES');

  useEffect(() => {
    setCurrentLocale(navigator.language || 'es-ES');
  }, []);

  const handleSummarizeRecord = async () => {
    setIsSummarizing(true);
    setSummary(null);
    try {
      const recordText = `
        Nombre del Paciente: ${patient.name}
        Fecha de Nacimiento: ${new Date(patient.dateOfBirth).toLocaleDateString(currentLocale)}
        Contacto: ${patient.contactInfo}

        Historial Médico:
        ${patient.medicalHistory}

        Resultados del Examen:
        ${patient.examinationResults}

        Planes de Tratamiento:
        ${patient.treatmentPlans}
      `;
      const result = await summarizeRecord({ recordText });
      setSummary(result.summary);
      toast({
        title: "Resumen Generado",
        description: "Resumen con IA creado exitosamente.",
      });
    } catch (error) {
      console.error("Error resumiendo historial:", error);
      toast({
        title: "Error",
        description: "Falló la generación del resumen. Ver consola para detalles.",
        variant: "destructive",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGenerateFullReport = async () => {
    setIsGeneratingFullReport(true);
    try {
      const input = {
        patientName: patient.name,
        medicalHistory: patient.medicalHistory,
        examinationResults: patient.examinationResults,
        treatmentPlans: patient.treatmentPlans,
      };
      const result = await generateReport(input);
      // In a real app, this 'result.report' would be used to create/update a Google Doc
      console.log("Contenido del Informe Completo Generado (simulado):", result.report);
      alert("Contenido del informe completo generado (ver consola). Creación en Google Docs no implementada.");
      toast({
        title: "Informe Completo Generado (Simulado)",
        description: "Contenido del informe listo. Integración con Google Docs pendiente.",
      });
    } catch (error) {
      console.error("Error generando informe completo:", error);
      toast({
        title: "Error",
        description: "Falló la generación del informe completo. Ver consola para detalles.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFullReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generar Resumen del Paciente</CardTitle>
          <CardDescription>Use IA para resumir rápidamente el historial actual del paciente.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSummarizeRecord} disabled={isSummarizing} className="w-full sm:w-auto">
            {isSummarizing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {isSummarizing ? "Generando Resumen..." : "Generar Resumen"}
          </Button>
          {summary && (
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold">Resumen Generado por IA:</h4>
              <Textarea value={summary} readOnly rows={8} className="bg-muted text-sm" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generar Informe Completo (Google Docs)</CardTitle>
          <CardDescription>
            Cree un documento de informe completo en Google Drive usando IA.
            (Esta es una acción simulada para propósitos de UI).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateFullReport} disabled={isGeneratingFullReport} className="w-full sm:w-auto">
             {isGeneratingFullReport ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            {isGeneratingFullReport ? "Generando Informe..." : "Generar y Guardar en Google Docs"}
          </Button>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                Nota: La creación real de Google Docs requiere integración con la API de Google Drive y autenticación, lo cual no está implementado en esta versión.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
