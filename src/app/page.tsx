// src/app/page.tsx (Login Page)
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActivitySquare, Eye, EyeOff } from "lucide-react";
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulación de login
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 selection:bg-primary/30">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="https://placehold.co/1920x1080.png?text=." 
          alt="Fondo abstracto medico"
          layout="fill"
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
          <CardTitle className="text-3xl font-bold tracking-tight">Bienvenido a EndoCloud Notes</CardTitle>
          <CardDescription className="text-muted-foreground">
            Ingresa tus credenciales para acceder al panel de gestión.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input/80 focus:bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-input/80 focus:bg-input pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            ¿No tienes cuenta? <a href="#" className="text-primary hover:underline" onClick={(e) => {e.preventDefault(); alert("Registro no implementado.");}}>Regístrate</a>
            <span className="mx-1">|</span>
            <a href="#" className="text-primary hover:underline" onClick={(e) => {e.preventDefault(); alert("Recuperación no implementada.");}}>¿Olvidaste tu contraseña?</a>
          </p>
        </CardContent>
      </Card>
       <p className="mt-8 text-xs text-muted-foreground/70">
        &copy; {new Date().getFullYear()} EndoCloud Notes. Todos los derechos reservados.
      </p>
    </div>
  );
}
