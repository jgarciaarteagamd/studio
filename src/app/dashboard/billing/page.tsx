// src/app/dashboard/billing/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Construction } from "lucide-react";

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
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Desde aquí, se podrán generar facturas asociadas a consultas o procedimientos,
            incluyendo detalles del paciente, servicios, costos y datos fiscales.
            El objetivo es facilitar la administración financiera de la práctica médica.
          </p>
          <p className="mb-4">
            Esta funcionalidad se encuentra actualmente en desarrollo. La secretaria y el médico podrán gestionar esta área.
          </p>
          <Button variant="outline" disabled>
            <Construction className="mr-2 h-4 w-4" />
            Crear Nueva Factura (Próximamente)
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-xl">Funcionalidades Futuras Planeadas</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>Selección de paciente y consulta(s) a facturar.</li>
                <li>Formulario detallado para ítems de factura, precios, impuestos.</li>
                <li>Configuración de datos fiscales del emisor (tomados del Perfil del Médico).</li>
                <li>Generación de PDF para la factura.</li>
                <li>Listado y seguimiento de facturas emitidas y sus estados (pagada, pendiente, etc.).</li>
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
