
// src/components/patients/PatientTable.tsx
"use client";

import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { PatientRecord } from "@/lib/types";
import { MoreHorizontal, FileEdit, Trash2, ChevronLeft, ChevronRight, Users } from "lucide-react"; // Removed FileText
import { useRouter } from 'next/navigation';
import { format } from 'date-fns'; // format is used in getLastConsultationDate
import { es } from 'date-fns/locale';
import { getPatientFullName, calculateAge, getLastConsultationDate } from "@/lib/mock-data";


interface PatientTableProps {
  patients: PatientRecord[];
}

const ITEMS_PER_PAGE = 10;
// Simulación de rol para esta tabla
const SIMULATED_TABLE_ROLE = 'doctor'; // Cambiar a 'secretary' para probar

export function PatientTable({ patients: initialPatients }: PatientTableProps) {
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState('es-ES');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [patients, setPatients] = useState<PatientRecord[]>(initialPatients);


  useEffect(() => {
    setCurrentLocale(navigator.language || 'es-ES');
    setPatients(initialPatients); // Sincronizar con prop si cambia
  }, [initialPatients]);

  // Filtrado de pacientes
  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;
    return patients.filter(patient => {
      const fullName = `${patient.personalDetails.nombres} ${patient.personalDetails.apellidos}`.toLowerCase();
      const doc = patient.personalDetails.documentoIdentidad?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return fullName.includes(term) || doc.includes(term);
    });
  }, [searchTerm, patients]);

  // Paginación
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPatients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPatients, currentPage]);

  const handleDeletePatient = (patientId: string) => {
    if (confirm("¿Está seguro de que desea eliminar este historial de paciente? Esta acción no se puede deshacer.")) {
      alert(`Eliminar paciente ${patientId} (simulado - no se elimina de mock data permanentemente)`);
      // En una aplicación real, aquí se llamaría a una API para eliminar
      // Por ahora, podemos filtrar el estado local para simular la eliminación en la UI:
      // setPatients(prev => prev.filter(p => p.id !== patientId));
      // Esto causaría problemas si la prop `initialPatients` no se actualiza,
      // así que para este mock es mejor solo mostrar el alert.
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (!patients.length && !searchTerm) {
    return (
        <div className="text-center py-10">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg text-muted-foreground">No hay pacientes registrados.</p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/patients/new">Crear Primer Historial de Paciente</Link>
          </Button>
        </div>
      );
  }


  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por nombre, apellidos o documento..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // Reset a la primera página con cada búsqueda
        }}
        className="max-w-sm"
      />
      {paginatedPatients.length === 0 && searchTerm && (
        <p className="text-muted-foreground text-center py-4">No se encontraron pacientes con "{searchTerm}".</p>
      )}
      {paginatedPatients.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Última Consulta</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/patients/${patient.id}`} className="hover:underline text-primary">
                      {getPatientFullName(patient)}
                    </Link>
                  </TableCell>
                  <TableCell>{calculateAge(patient.personalDetails.fechaNacimiento)}</TableCell>
                  <TableCell>{getLastConsultationDate(patient)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/patients/${patient.id}`)}>
                          <FileEdit className="mr-2 h-4 w-4" />
                          Ver/Editar Historial
                        </DropdownMenuItem>
                        {SIMULATED_TABLE_ROLE === 'doctor' && (
                          <>
                            {/* "Generar Informe IA" se eliminó de esta vista */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeletePatient(patient.id)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
