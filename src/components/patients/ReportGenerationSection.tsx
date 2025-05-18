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
import { getPatientFullName } from '@/lib/mock-data';

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
      // Prepare input based on the new PatientRecord structure
      const inputForSummary = {
        personalDetails: {
          ...patient.personalDetails,
          fechaNacimiento: new Date(patient.personalDetails.fechaNacimiento).toLocaleDateString('es-ES'), // Format for AI
        },
        backgroundInformation: patient.backgroundInformation,
        medicalEncounters: patient.medicalEncounters.map(enc => ({
            ...enc,
            date: new Date(enc.date).toLocaleDateString('es-ES'), // Format for AI
        })),
      };
      const result = await summarizeRecord(inputForSummary);
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
      // Prepare input for the full report
      const inputForReport = {
        personalDetails: {
          ...patient.personalDetails,
          fechaNacimiento: new Date(patient.personalDetails.fechaNacimiento).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
        },
        datosFacturacion: patient.datosFacturacion,
        backgroundInformation: patient.backgroundInformation,
        medicalEncounters: patient.medicalEncounters.map(enc => ({
            ...enc,
            date: new Date(enc.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
        })),
      };
      const result = await generateReport(inputForReport);
      
      const blob = new Blob([result.report], { type: 'text/markdown;charset=utf-8' });
      const link = document.createElement('a');
      const patientFullName = getPatientFullName(patient).replace(/\s+/g, '_');
      link.download = `Informe_${patientFullName}_${new Date().toISOString().split('T')[0]}.md`;
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast({
        title: "Informe Completo Generado y Descargado",
        description: "El informe en formato Markdown se ha descargado.",
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
          <Button onClick={handleSummarizeRecord} disabled={isSummarizing || !patient.medicalEncounters || patient.medicalEncounters.length === 0} className="w-full sm:w-auto">
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
              <Textarea value={summary} readOnly rows={10} className="bg-muted text-sm whitespace-pre-wrap" />
            </div>
          )}
           {(!patient.medicalEncounters || patient.medicalEncounters.length === 0) && !isSummarizing && (
            <p className="mt-4 text-sm text-muted-foreground">Se requiere al menos una consulta médica para generar un resumen.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generar Informe Completo (Descargar Markdown)</CardTitle>
          <CardDescription>
            Cree un documento de informe completo en formato Markdown usando IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateFullReport} disabled={isGeneratingFullReport || !patient.medicalEncounters || patient.medicalEncounters.length === 0} className="w-full sm:w-auto">
             {isGeneratingFullReport ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            {isGeneratingFullReport ? "Generando Informe..." : "Generar y Descargar Informe"}
          </Button>
        </CardContent>
         {(!patient.medicalEncounters || patient.medicalEncounters.length === 0) && !isGeneratingFullReport && (
            <CardFooter>
                <p className="text-sm text-muted-foreground">Se requiere al menos una consulta médica para generar un informe completo.</p>
            </CardFooter>
          )}
      </Card>
    </div>
  );
}
