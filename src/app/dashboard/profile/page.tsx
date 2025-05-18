// src/app/dashboard/profile/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, Construction, Upload } from "lucide-react";
// import { useRouter } from "next/navigation"; // Descomentar si se implementa lógica de roles real

export default function ProfilePage() {
  // const router = useRouter(); // Descomentar si se implementa lógica de roles real
  // En un sistema real, aquí se verificaría el rol del usuario.
  // const isDoctor = true; // Simulación del rol de médico
  // if (!isDoctor) { router.push('/dashboard'); return null; } // Redirigir si no es médico

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <UserCircle className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Perfil del Médico</CardTitle>
          </div>
          <CardDescription>
            Gestione su información personal, profesional, fiscal y de marca. Esta sección es solo para médicos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Esta sección le permite actualizar sus datos personales, de contacto,
            detalles profesionales como su especialidad y número de matrícula,
            información tributaria necesaria para la facturación, y subir su logotipo
            personal o de la clínica para que aparezca en informes, recetas y facturas.
          </p>
          <p className="mb-4">
            La funcionalidad completa se encuentra actualmente en desarrollo.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" disabled>
              <Construction className="mr-2 h-4 w-4" />
              Editar Datos (Próximamente)
            </Button>
            <Button variant="outline" disabled>
              <Upload className="mr-2 h-4 w-4" />
              Subir Logotipo (Próximamente)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-xl">Campos a Gestionar (Próximamente)</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>Datos Personales: Nombre, Apellido.</li>
                <li>Datos de Contacto: Email, Teléfono, Dirección del Consultorio.</li>
                <li>Datos Profesionales: Especialidad, Número de Matrícula/Licencia.</li>
                <li>Datos Tributarios: Razón Social, CUIT/NIF, Domicilio Fiscal.</li>
                <li>Logotipo: Carga de imagen (PNG, JPG, SVG) para personalizar documentos.</li>
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
