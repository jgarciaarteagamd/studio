// src/app/dashboard/patients/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientTable } from "@/components/patients/PatientTable";
import { mockPatients } from "@/lib/mock-data";
import { PlusCircle, Users } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from 'react';
import type { PatientRecord } from '@/lib/types';

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sort patients by updatedAt to get the most recent first
    setPatients(mockPatients.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    setIsLoading(false);
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Historiales de Pacientes</CardTitle>
          </div>
          <CardDescription>
            Ver, buscar, gestionar y crear historiales de pacientes.
          </CardDescription>
          <Button asChild size="lg" className="w-full sm:w-auto mt-6">
            <Link href="/dashboard/patients/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              Agregar Nuevo Paciente
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando datos de pacientes...</p> 
          ) : ( 
            <PatientTable patients={patients} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
