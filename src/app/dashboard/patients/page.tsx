// src/app/dashboard/patients/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PatientTable } from "@/components/patients/PatientTable";
import { mockPatients, getPatientFullName } from "@/lib/mock-data";
import { PlusCircle, Users } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from 'react';
import type { PatientRecord } from '@/lib/types';

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Sort patients by updatedAt to get the most recent ones first
    setPatients(mockPatients.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    setIsLoading(false);
  }, []);

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;
    return patients.filter(patient => {
      const fullName = getPatientFullName(patient).toLowerCase();
      const doc = patient.personalDetails.documentoIdentidad?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return fullName.includes(term) || doc.includes(term);
    });
  }, [searchTerm, patients]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <Card className="shadow-lg w-full">
        <CardHeader className="space-y-1.5 p-6 pt-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Historiales de Pacientes</CardTitle>
          </div>
          {/* CardDescription fue eliminada según solicitud previa */}
          <div className="pt-4 space-y-4">
            <Button asChild size="lg" className="w-full">
              <Link href="/dashboard/patients/new">
                <PlusCircle className="h-4 w-4" />
                Agregar Nuevo Paciente
              </Link>
            </Button>
            <Input
              placeholder="Buscar por nombre, apellidos o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {isLoading ? (
            <p>Cargando datos de pacientes...</p>
          ) : (
            <PatientTable patients={filteredPatients} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
