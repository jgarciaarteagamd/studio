
// src/app/page.tsx (Login Page)
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ActivitySquare, LogIn } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link'; // Import Link
import { setSimulatedRole } from '@/lib/mock-data';
import { auth } from '@/lib/firebase-config';
import { GoogleAuthProvider, signInWithPopup, type UserCredential } from "firebase/auth";
import { useToast } from '@/hooks/use-toast';


// SVG for Google G Logo
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingSecretary, setIsLoadingSecretary] = useState(false);
  const [secretaryUser, setSecretaryUser] = useState('');
  const [secretaryPassword, setSecretaryPassword] = useState('');

  const handleDoctorLogin = async () => {
    setIsLoadingGoogle(true);
    const provider = new GoogleAuthProvider();
    try {
      const result: UserCredential = await signInWithPopup(auth, provider);
      // Inicio de sesión exitoso
      const user = result.user;
      console.log("Usuario de Google autenticado:", user);
      toast({
        title: "Inicio de Sesión Exitoso",
        description: `Bienvenido Dr(a). ${user.displayName || user.email}`,
      });
      setSimulatedRole('doctor');
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error en inicio de sesión con Google:", error);
      toast({
        title: "Error de Inicio de Sesión",
        description: error.message || "No se pudo iniciar sesión con Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleSecretaryLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingSecretary(true);
    console.log("Intento de login de secretaria:", { user: secretaryUser, pass: secretaryPassword });
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSimulatedRole('secretary');
    setIsLoadingSecretary(false);
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 selection:bg-primary/30">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="https://placehold.co/1920x1080.png?text=."
          alt="Fondo abstracto medico"
          fill
          objectFit="cover"
          quality={80}
          className="opacity-20 blur-sm"
          data-ai-hint="medical abstract"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-background"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl bg-card/90 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center space-y-2 pt-8">
          <ActivitySquare className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-3xl font-bold tracking-tight">Bienvenido a MedLog</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Sección Médico */}
          <div>
            <h3 className="text-lg font-medium text-center mb-3 text-primary">Acceso Médico</h3>
            <Button 
              onClick={handleDoctorLogin} 
              className="w-full text-base py-3" 
              disabled={isLoadingGoogle || isLoadingSecretary}
            >
              {isLoadingGoogle ? (
                'Ingresando...'
              ) : (
                <>
                  <GoogleIcon />
                  Acceder con Google
                </>
              )}
            </Button>
            <CardDescription className="text-xs text-muted-foreground text-center mt-2">
              (Para administradores)
            </CardDescription>
          </div>

          <Separator />

          {/* Sección Secretario/a */}
          <div>
            <h3 className="text-lg font-medium text-center mb-4 text-primary">Acceso Personal Asistencial</h3>
            <form onSubmit={handleSecretaryLogin} className="space-y-4">
              <div>
                <Label htmlFor="secretaryUser">Usuario</Label>
                <Input
                  id="secretaryUser"
                  type="text"
                  placeholder="Ej: gonmar08"
                  value={secretaryUser}
                  onChange={(e) => setSecretaryUser(e.target.value)}
                  disabled={isLoadingGoogle || isLoadingSecretary}
                  required
                />
              </div>
              <div>
                <Label htmlFor="secretaryPassword">Contraseña</Label>
                <Input
                  id="secretaryPassword"
                  type="password"
                  placeholder="••••••••"
                  value={secretaryPassword}
                  onChange={(e) => setSecretaryPassword(e.target.value)}
                  disabled={isLoadingGoogle || isLoadingSecretary}
                  required
                />
              </div>
              <Button type="submit" className="w-full text-base py-3" disabled={isLoadingGoogle || isLoadingSecretary}>
                {isLoadingSecretary ? 'Ingresando...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center p-6 pt-2">
           <p className="text-xs text-muted-foreground text-center">
            Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad.
          </p>
          <p className="mt-4 text-xs text-muted-foreground/70">
            &copy; {new Date().getFullYear()} MedLog. Todos los derechos reservados.
          </p>
          <Link href="/superadmin/login" className="mt-3 text-xs text-muted-foreground/50 hover:text-muted-foreground/70 hover:underline">
            SuperAdmin
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
