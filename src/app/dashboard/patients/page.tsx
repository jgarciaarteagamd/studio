// src/app/dashboard/patients/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientTable } from "@/components/patients/PatientTable"; // PatientTable needs to be adapted
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
      setPatients(mockPatients); // mockPatients should now have the new structure
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historiales de Pacientes</h1>
          <p className="text-muted-foreground">
            Ver, gestionar y crear historiales de pacientes.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/patients/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Agregar Nuevo Paciente
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Todos los Pacientes</CardTitle>
          <CardDescription>
            Una lista de todos los historiales de pacientes en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando datos de pacientes...</p> 
          ) : patients.length > 0 ? (
            <PatientTable patients={patients} />
          ) : (
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No se encontraron pacientes.</p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/patients/new">Crear Primer Historial de Paciente</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
