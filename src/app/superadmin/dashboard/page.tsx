// src/app/superadmin/dashboard/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Settings, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Panel de SuperAdministración</CardTitle>
          <CardDescription>
            Gestión centralizada de cuentas de médicos y configuración de la plataforma MedLog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Desde aquí podrá administrar las suscripciones, habilitar y deshabilitar cuentas de médicos,
            y ver estadísticas generales de la plataforma.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Médicos Activos</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 <span className="text-xs text-muted-foreground">(Simulado)</span></div>
            <p className="text-xs text-muted-foreground">
              Total de cuentas de médicos con suscripción activa.
            </p>
            <Button variant="outline" size="sm" className="mt-4 w-full" disabled>
              Ver Médicos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevas Solicitudes</CardTitle>
            <UserPlus className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 <span className="text-xs text-muted-foreground">(Simulado)</span></div>
            <p className="text-xs text-muted-foreground">
              Solicitudes de nuevas suscripciones o pruebas pendientes.
            </p>
            <Button variant="outline" size="sm" className="mt-4 w-full" disabled>
              Gestionar Solicitudes
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configuración General</CardTitle>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <p className="text-xs text-muted-foreground h-10">
              Ajustes de planes de suscripción, pasarelas de pago, etc.
            </p>
            <Button variant="outline" size="sm" className="mt-4 w-full" disabled>
              Ir a Configuración
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
             <Button className="w-full sm:w-auto" disabled>
                <UserPlus className="mr-2 h-4 w-4" /> Agregar Nuevo Médico (Manual)
            </Button>
            <Button variant="secondary" className="w-full sm:w-auto" disabled>
                <BarChart3 className="mr-2 h-4 w-4" /> Ver Reportes de Uso
            </Button>
             <Link href="/superadmin/login" passHref className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">
                    Ir a Login de SuperAdmin
                </Button>
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
