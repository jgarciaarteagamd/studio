// src/app/dashboard/billing/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, FilePlus2, Edit3, Printer, Search, Banknote, Construction, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Invoice } from "@/lib/types";
import { getMockInvoices, SIMULATED_CURRENT_ROLE, SIMULATED_SECRETARY_PERMISSIONS } from "@/lib/mock-data";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 5;

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const canAccessBilling = SIMULATED_CURRENT_ROLE === 'doctor' || (SIMULATED_CURRENT_ROLE === 'secretary' && SIMULATED_SECRETARY_PERMISSIONS.billing.canAccess);

  useEffect(() => {
    if (canAccessBilling) {
      setInvoices(getMockInvoices());
    }
    setIsLoading(false);
  }, [canAccessBilling]);

  const filteredInvoices = invoices.filter(invoice =>
    invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  const getStatusBadgeVariant = (status: Invoice['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pagada': return 'default'; // Primary color (green by default in theme)
      case 'emitida': return 'secondary';
      case 'borrador': return 'outline';
      case 'anulada': return 'destructive';
      case 'vencida': return 'destructive'; // Podría ser 'warning' si tuviéramos ese variant
      default: return 'outline';
    }
  };
  
  const getStatusText = (status: Invoice['status']): string => {
    const map: Record<Invoice['status'], string> = {
      borrador: "Borrador",
      emitida: "Emitida",
      pagada: "Pagada",
      anulada: "Anulada",
      vencida: "Vencida",
    };
    return map[status] || status;
  };

  if (!canAccessBilling) {
    return (
      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No tiene permisos para acceder a la sección de facturación.</p>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Gestión de Facturación</CardTitle>
            </div>
            <Button onClick={() => alert("Abrir modal/página para crear nueva factura (no implementado).")} disabled>
              <FilePlus2 className="mr-2 h-5 w-5" />
              Crear Nueva Factura
            </Button>
          </div>
          <CardDescription>
            Cree, gestione y realice el seguimiento de las facturas por los servicios médicos prestados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Buscar por paciente o número de factura..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="max-w-sm"
            />
          </div>
          {isLoading ? (
            <p>Cargando facturas...</p>
          ) : paginatedInvoices.length > 0 ? (
            <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Factura</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Fecha Emisión</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.patientName}</TableCell>
                      <TableCell>{format(new Date(invoice.dateIssued), "P", { locale: es })}</TableCell>
                      <TableCell className="text-right">${invoice.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>{getStatusText(invoice.status)}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" onClick={() => alert(`Ver/Editar Factura ${invoice.invoiceNumber} (no implementado).`)} disabled>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => alert(`Imprimir Factura ${invoice.invoiceNumber} (no implementado).`)} disabled>
                          <Printer className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
            </>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {searchTerm ? `No se encontraron facturas para "${searchTerm}".` : "No hay facturas para mostrar."}
            </p>
          )}
           <CardFooter className="pt-6">
            <p className="text-xs text-muted-foreground">
                Funcionalidades como la creación detallada de facturas, edición, impresión a PDF, y cambios de estado se encuentran en desarrollo.
            </p>
           </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}
