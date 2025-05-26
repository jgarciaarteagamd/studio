
// src/app/dashboard/patients/page.tsx
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
    // En una aplicación real, esto podría ser una llamada a una API
    // y la paginación/búsqueda podrían ser del lado del servidor.
    setPatients(mockPatients.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    setIsLoading(false);
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historiales de Pacientes</h1>
          <p className="text-muted-foreground">
            Ver, buscar, gestionar y crear historiales de pacientes.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/patients/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Agregar Nuevo Paciente
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg w-full">
        <CardHeader>
          <CardTitle>Todos los Pacientes</CardTitle>
          <CardDescription>
            Lista de todos los historiales de pacientes en el sistema. Use el buscador para filtrar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando datos de pacientes...</p> 
          ) : ( // PatientTable ahora maneja el estado de "no hay pacientes"
            <PatientTable patients={patients} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
