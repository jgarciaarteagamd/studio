
// src/app/dashboard/billing/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, FilePlus2, Edit3, Printer, ChevronLeft, ChevronRight, FileText, CalendarDays, DollarSign, ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Invoice, InvoiceStatus } from "@/lib/types";
import { getMockInvoices, updateInvoiceStatus, SIMULATED_CURRENT_ROLE, SIMULATED_SECRETARY_PERMISSIONS, getPatientFullName, getDoctorProfile } from "@/lib/mock-data";
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 6; 

const invoiceStatusOptions: { value: InvoiceStatus; label: string }[] = [
  { value: 'borrador', label: 'Borrador' },
  { value: 'emitida', label: 'Emitida' },
  { value: 'pagada', label: 'Pagada' },
  { value: 'anulada', label: 'Anulada' },
  { value: 'vencida', label: 'Vencida' },
];

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const canAccessBilling = SIMULATED_CURRENT_ROLE === 'doctor' || (SIMULATED_CURRENT_ROLE === 'secretary' && SIMULATED_SECRETARY_PERMISSIONS.billing.canAccess);
  const canChangeInvoiceStatus = canAccessBilling; // Simplified for now

  useEffect(() => {
    if (canAccessBilling) {
      setInvoices(getMockInvoices());
    }
    setIsLoading(false);
  }, [canAccessBilling]);

  const filteredInvoices = useMemo(() => invoices.filter(invoice =>
    invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ), [invoices, searchTerm]);

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = useMemo(() => filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ), [filteredInvoices, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  const getStatusBadgeVariant = (status: InvoiceStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pagada': return 'default';
      case 'emitida': return 'secondary';
      case 'borrador': return 'outline';
      case 'anulada': return 'destructive';
      case 'vencida': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getStatusText = (status: InvoiceStatus): string => {
    const map: Record<InvoiceStatus, string> = {
      borrador: "Borrador",
      emitida: "Emitida",
      pagada: "Pagada",
      anulada: "Anulada",
      vencida: "Vencida",
    };
    return map[status] || status;
  };

  const handleInvoiceStatusChange = (invoiceId: string, newStatus: InvoiceStatus) => {
    const updatedInvoice = updateInvoiceStatus(invoiceId, newStatus);
    if (updatedInvoice) {
      setInvoices(prevInvoices => 
        prevInvoices.map(inv => inv.id === invoiceId ? updatedInvoice : inv)
      );
      toast({
        title: "Estado de Factura Actualizado",
        description: `La factura ${updatedInvoice.invoiceNumber} ahora está ${getStatusText(newStatus)}.`,
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la factura.",
        variant: "destructive",
      });
    }
  };

  const handlePrintInvoicePdf = (invoice: Invoice) => {
    const doctorProfile = getDoctorProfile(); 
    let pdfContent = `== FACTURA ==\n\n`;
    pdfContent += `Número de Factura: ${invoice.invoiceNumber}\n`;
    pdfContent += `Fecha de Emisión: ${format(new Date(invoice.dateIssued), "P", { locale: es })}\n`;
    if (invoice.dateDue) {
      pdfContent += `Fecha de Vencimiento: ${format(new Date(invoice.dateDue), "P", { locale: es })}\n`;
    }
    pdfContent += `\n-- Datos del Emisor --\n`;
    pdfContent += `Razón Social: ${doctorProfile.fiscalDetails.razonSocialFacturacion}\n`;
    pdfContent += `Identificación Tributaria: ${doctorProfile.fiscalDetails.identificacionTributaria}\n`;
    pdfContent += `Domicilio Fiscal: ${doctorProfile.fiscalDetails.domicilioFiscalCompleto}\n`;
    if (doctorProfile.contactDetails.telefonoPrincipal) {
      pdfContent += `Teléfono: ${doctorProfile.contactDetails.telefonoPrincipal}\n`;
    }
    if (doctorProfile.contactDetails.emailContacto) {
       pdfContent += `Email: ${doctorProfile.contactDetails.emailContacto}\n`;
    }


    pdfContent += `\n-- Datos del Cliente --\n`;
    pdfContent += `Paciente: ${invoice.patientName}\n`;
    
    pdfContent += `\n-- Detalles de la Factura --\n`;
    invoice.items.forEach(item => {
      pdfContent += `- ${item.description} (Cant: ${item.quantity}, P.Unit: $${item.unitPrice.toFixed(2)}): $${item.total.toFixed(2)}\n`;
    });
    pdfContent += `\nSubtotal: $${invoice.subtotal.toFixed(2)}\n`;
    if (invoice.taxAmount) {
      pdfContent += `IVA (${(invoice.taxRate || 0) * 100}%): $${invoice.taxAmount.toFixed(2)}\n`;
    }
    pdfContent += `Total: $${invoice.totalAmount.toFixed(2)}\n`;
    pdfContent += `Estado: ${getStatusText(invoice.status)}\n`;

    if (invoice.notes) {
      pdfContent += `\nNotas Adicionales:\n${invoice.notes}\n`;
    }

    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const safePatientName = invoice.patientName.replace(/\s+/g, '_');
    link.download = `Factura_${invoice.invoiceNumber}_${safePatientName}.pdf`;
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    toast({
      title: "Descarga de Factura (Simulada)",
      description: `La factura ${invoice.invoiceNumber} se está descargando como un archivo de texto con extensión .pdf.`,
    });
  };


  if (!canAccessBilling) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto w-full">
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
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Receipt className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Gestión de Facturación</CardTitle>
          </div>
          <CardDescription className="mb-4">
            Cree, gestione y realice el seguimiento de las facturas por los servicios médicos prestados.
            La generación de facturas electrónicas (SRI) no está implementada.
          </CardDescription>
           <Button 
            onClick={() => alert("Abrir modal/página para crear nueva factura (no implementado).")} 
            disabled 
            className="w-full sm:w-auto mt-6"
            size="lg"
           >
            <FilePlus2 className="mr-2 h-5 w-5" />
            Crear Nueva Factura
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Buscar por paciente o número de factura..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="max-w-md"
            />
          </div>

          {isLoading ? (
            <p>Cargando facturas...</p>
          ) : paginatedInvoices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedInvoices.map((invoice) => (
                <Card key={invoice.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-primary">{invoice.invoiceNumber}</CardTitle>
                      <Badge variant={getStatusBadgeVariant(invoice.status)} className="text-xs">
                        {getStatusText(invoice.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground pt-1">{invoice.patientName}</p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm flex-grow">
                    <div className="flex items-center">
                      <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Emitida: {format(new Date(invoice.dateIssued), "P", { locale: es })}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Total: ${invoice.totalAmount.toFixed(2)}</span>
                    </div>
                    {canChangeInvoiceStatus && (
                      <div className="pt-2">
                        <Select
                          value={invoice.status}
                          onValueChange={(newStatus) => handleInvoiceStatusChange(invoice.id, newStatus as InvoiceStatus)}
                        >
                          <SelectTrigger className="text-xs h-9">
                             <ListFilter className="mr-2 h-3 w-3" />
                             <span>Cambiar Estado</span>
                          </SelectTrigger>
                          <SelectContent>
                            {invoiceStatusOptions.map(opt => (
                              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => alert(`Ver/Editar Factura ${invoice.invoiceNumber} (no implementado).`)} disabled>
                      <Edit3 className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Editar</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handlePrintInvoicePdf(invoice)}>
                      <Printer className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Imprimir PDF</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">
              {searchTerm ? `No se encontraron facturas para "${searchTerm}".` : "No hay facturas para mostrar."}
            </p>
          )}

          {totalPages > 1 && paginatedInvoices.length > 0 && (
            <div className="flex items-center justify-between pt-8 mt-6 border-t">
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

           <CardFooter className="pt-8 mt-6 border-t">
            <p className="text-xs text-muted-foreground">
                Funcionalidades como la creación detallada de facturas y edición se encuentran en desarrollo. 
                La impresión genera un archivo de texto con formato PDF (simulado).
            </p>
           </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}
