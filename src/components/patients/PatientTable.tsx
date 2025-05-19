
// src/components/patients/PatientTable.tsx
"use client";

import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// DropdownMenu components are no longer needed if actions column is removed
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { PatientRecord } from "@/lib/types";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useRouter } from 'next/navigation';
import { getPatientFullName, calculateAge, getLastConsultationDate } from "@/lib/mock-data";


interface PatientTableProps {
  patients: PatientRecord[];
}

const ITEMS_PER_PAGE = 10;

export function PatientTable({ patients: initialPatients }: PatientTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [patients, setPatients] = useState<PatientRecord[]>(initialPatients);


  useEffect(() => {
    setPatients(initialPatients); 
  }, [initialPatients]);

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;
    return patients.filter(patient => {
      const fullName = `${patient.personalDetails.nombres} ${patient.personalDetails.apellidos}`.toLowerCase();
      const doc = patient.personalDetails.documentoIdentidad?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return fullName.includes(term) || doc.includes(term);
    });
  }, [searchTerm, patients]);

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPatients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPatients, currentPage]);

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
          setCurrentPage(1); 
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
                {/* Actions column removed */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPatients.map((patient) => (
                <TableRow key={patient.id} onClick={() => router.push(`/dashboard/patients/${patient.id}`)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/patients/${patient.id}`} className="hover:underline text-primary" onClick={(e) => e.stopPropagation()}>
                      {getPatientFullName(patient)}
                    </Link>
                  </TableCell>
                  <TableCell>{calculateAge(patient.personalDetails.fechaNacimiento)}</TableCell>
                  <TableCell>{getLastConsultationDate(patient)}</TableCell>
                  {/* Actions cell removed */}
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
