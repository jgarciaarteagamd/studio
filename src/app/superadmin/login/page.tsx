// src/app/superadmin/login/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuperAdminLoginPage() {
  const router = useRouter();

  const handleSuperAdminLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Simulación de login exitoso
    alert("Inicio de sesión de SuperAdmin simulado exitosamente.");
    router.push("/superadmin/dashboard");
  };

  return (
    <div className="flex min-h-[calc(100vh-150px)] flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2 pt-8">
          <LogIn className="mx-auto h-10 w-10 text-primary" />
          <CardTitle className="text-2xl font-bold tracking-tight">Acceso SuperAdmin</CardTitle>
          <CardDescription>
            Ingrese sus credenciales de superadministrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSuperAdminLogin} className="space-y-6">
            <div>
              <Label htmlFor="superAdminUser">Usuario SuperAdmin</Label>
              <Input
                id="superAdminUser"
                type="text"
                placeholder="superadmin"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="superAdminPassword">Contraseña</Label>
              <Input
                id="superAdminPassword"
                type="password"
                placeholder="••••••••"
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full text-base py-3">
              Ingresar
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Esta sección es solo para administradores autorizados de MedLog.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
