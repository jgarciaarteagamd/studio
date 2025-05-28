// src/app/superadmin/layout.tsx
import type { Metadata } from 'next';
// No necesitamos importar Geist aquí, se hereda del RootLayout
import '@/app/globals.css'; // Reutilizamos los globales por ahora para la fuente y estilos base

export const metadata: Metadata = {
  title: 'SuperAdmin | MedLog',
  description: 'Panel de SuperAdministración de MedLog.',
};

export default function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-xl font-semibold">Panel de SuperAdministración - MedLog</h1>
        </div>
      </header>
      <main className="p-4 sm:p-6 md:p-8">
        {children}
      </main>
      <footer className="text-center p-4 text-sm text-gray-600 border-t">
        &copy; {new Date().getFullYear()} MedLog SuperAdmin.
      </footer>
    </>
  );
}
