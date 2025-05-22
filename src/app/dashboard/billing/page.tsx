// src/app/dashboard/billing/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Construction, ListChecks, FilePlus2, Search, Banknote, Printer } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Receipt className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Gestión de Facturación</CardTitle>
          </div>
          <CardDescription>
            Esta sección está dedicada a la creación y gestión de facturas por los servicios médicos prestados.
            Tanto el médico como el personal asistencial (con los permisos adecuados) podrán gestionar esta área.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">
            Desde aquí, se podrán generar facturas detalladas asociadas a consultas o procedimientos. El sistema facilitará
            la inclusión de datos del paciente, servicios prestados, costos individuales, impuestos aplicables y
            los datos fiscales del médico emisor (configurados en la sección "Perfil Médico").
            El objetivo es optimizar la administración financiera de la práctica médica y asegurar una facturación precisa y profesional.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
                <h4 className="font-semibold text-lg flex items-center"><FilePlus2 className="mr-2 h-5 w-5 text-primary" /> Creación de Facturas</h4>
                <p className="text-sm text-muted-foreground">
                    Formulario intuitivo para seleccionar paciente y consulta(s) a facturar, añadir ítems de servicio,
                    definir precios y calcular totales automáticamente.
                </p>
            </div>
            <div className="space-y-2">
                <h4 className="font-semibold text-lg flex items-center"><Banknote className="mr-2 h-5 w-5 text-primary" /> Integración Fiscal</h4>
                <p className="text-sm text-muted-foreground">
                    Utilización de los datos fiscales (Razón Social, RUC/NIF, etc.) configurados en el Perfil del Médico
                    para asegurar la validez y conformidad de las facturas.
                </p>
            </div>
             <div className="space-y-2">
                <h4 className="font-semibold text-lg flex items-center"><Printer className="mr-2 h-5 w-5 text-primary" /> Generación de Documentos</h4>
                <p className="text-sm text-muted-foreground">
                    Opción para generar un PDF de la factura, listo para imprimir o enviar digitalmente al paciente,
                    incluyendo el logotipo del médico si ha sido configurado.
                </p>
            </div>
            <div className="space-y-2">
                <h4 className="font-semibold text-lg flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary" /> Seguimiento y Estados</h4>
                <p className="text-sm text-muted-foreground">
                    Listado de todas las facturas emitidas con filtros por fecha, paciente o estado (pagada, pendiente, anulada).
                    Posibilidad de marcar facturas como pagadas y gestionar anulaciones.
                </p>
            </div>
          </div>
          <p className="mb-4 text-center font-semibold">
            Esta funcionalidad se encuentra actualmente en desarrollo.
          </p>
          <div className="flex justify-center">
            <Button variant="outline" disabled>
                <Construction className="mr-2 h-4 w-4" />
                Ver Prototipo de Creación de Factura (Próximamente)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
