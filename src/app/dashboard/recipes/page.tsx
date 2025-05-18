// src/app/dashboard/recipes/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Esta página ahora redirige a la nueva página de creación de recetas.
// Podría eliminarse si no hay otros enlaces apuntando aquí.
export default function RecipesRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/recipes/new');
  }, [router]);

  return (
    <div>
      <p>Redirigiendo a la nueva página de creación de recetas...</p>
    </div>
  );
}
