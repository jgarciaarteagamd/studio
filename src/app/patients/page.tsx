// src/app/patients/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientTable } from "@/components/patients/PatientTable";
import { mockPatients } from "@/lib/mock-data";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from 'react';
import type { PatientRecord } from '@/lib/types';

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setPatients(mockPatients);
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Records</h1>
          <p className="text-muted-foreground">
            View, manage, and create patient records.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/patients/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Patient
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Patients</CardTitle>
          <CardDescription>
            A list of all patient records in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading patient data...</p> // Replace with Skeleton loader for better UX
          ) : patients.length > 0 ? (
            <PatientTable patients={patients} />
          ) : (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No patients found.</p>
              <Button asChild className="mt-4">
                <Link href="/patients/new">Create First Patient Record</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
