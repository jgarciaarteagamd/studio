// src/components/patients/ReportGenerationSection.tsx
"use client";

import type React from 'react';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, ExternalLink } from "lucide-react";
import type { PatientRecord } from "@/lib/types";
import { summarizeRecord, generateReport } from "@/ai/flows"; // Assuming these are correctly set up
import { useToast } from "@/hooks/use-toast";

interface ReportGenerationSectionProps {
  patient: PatientRecord;
}

export function ReportGenerationSection({ patient }: ReportGenerationSectionProps) {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingFullReport, setIsGeneratingFullReport] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSummarizeRecord = async () => {
    setIsSummarizing(true);
    setSummary(null);
    try {
      const recordText = `
        Patient Name: ${patient.name}
        Date of Birth: ${new Date(patient.dateOfBirth).toLocaleDateString()}
        Contact: ${patient.contactInfo}

        Medical History:
        ${patient.medicalHistory}

        Examination Results:
        ${patient.examinationResults}

        Treatment Plans:
        ${patient.treatmentPlans}
      `;
      const result = await summarizeRecord({ recordText });
      setSummary(result.summary);
      toast({
        title: "Summary Generated",
        description: "AI-powered summary created successfully.",
      });
    } catch (error) {
      console.error("Error summarizing record:", error);
      toast({
        title: "Error",
        description: "Failed to generate summary. See console for details.",
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
      console.log("Generated Full Report Content (mock):", result.report);
      alert("Full report content generated (see console). Google Docs creation not implemented.");
      toast({
        title: "Full Report Generated (Mock)",
        description: "Report content ready. Google Docs integration pending.",
      });
    } catch (error) {
      console.error("Error generating full report:", error);
      toast({
        title: "Error",
        description: "Failed to generate full report. See console for details.",
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
          <CardTitle>Generate Patient Summary</CardTitle>
          <CardDescription>Use AI to quickly summarize the patient's current record.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSummarizeRecord} disabled={isSummarizing} className="w-full sm:w-auto">
            {isSummarizing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {isSummarizing ? "Generating Summary..." : "Generate Summary"}
          </Button>
          {summary && (
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold">AI Generated Summary:</h4>
              <Textarea value={summary} readOnly rows={8} className="bg-muted text-sm" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generate Full Report (Google Docs)</CardTitle>
          <CardDescription>
            Create a comprehensive report document in Google Drive using AI.
            (This is a mock action for UI purposes).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateFullReport} disabled={isGeneratingFullReport} className="w-full sm:w-auto">
             {isGeneratingFullReport ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            {isGeneratingFullReport ? "Generating Report..." : "Generate & Save to Google Docs"}
          </Button>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                Note: Actual Google Docs creation requires Google Drive API integration and authentication, which is not implemented in this version.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
