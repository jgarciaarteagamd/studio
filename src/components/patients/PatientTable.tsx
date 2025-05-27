// src/components/patients/PatientTable.tsx
"use client";

import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
// Input no longer needed here
import type { PatientRecord } from "@/lib/types";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useRouter } from 'next/navigation';
import { getPatientFullName, calculateAge, getLastConsultationDate } from "@/lib/mock-data";


interface PatientTableProps {
  patients: PatientRecord[]; // Expects already filtered patients
}

const ITEMS_PER_PAGE = 10;

export function PatientTable({ patients }: PatientTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when patients data changes (e.g., due to search)
  useEffect(() => {
    setCurrentPage(1);
  }, [patients]);

  const totalPages = Math.ceil(patients.length / ITEMS_PER_PAGE);
  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return patients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [patients, currentPage]);

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

  if (!patients.length) {
    return (
        <div className="text-center py-10">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg text-muted-foreground">No se encontraron pacientes con los criterios de búsqueda.</p>
        </div>
      );
  }


  return (
    <div className="space-y-4">
      {/* Search Input moved to the parent page component */}
      {paginatedPatients.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Última Consulta</TableHead>
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
