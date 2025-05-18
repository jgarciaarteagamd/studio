// src/components/layout/SidebarNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, CalendarDays, Receipt, UserCircle, FileSignature, Stethoscope, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Simulación de rol actual
const SIMULATED_CURRENT_ROLE = "doctor"; // Cambiar a "secretary" para probar la visibilidad

const navItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard, roles: ["doctor", "secretary"] },
  { href: "/dashboard/patients", label: "Pacientes", icon: Users, roles: ["doctor", "secretary"] },
  // Nuevos elementos de acción directa para médicos:
  { href: "/dashboard/consultations/new", label: "Nueva Consulta", icon: Stethoscope, roles: ["doctor"], isAction: true },
  { href: "/dashboard/recipes/new", label: "Nueva Receta", icon: PlusCircle, roles: ["doctor"], isAction: true },
  // Secciones principales restantes:
  { href: "/dashboard/schedule", label: "Agenda", icon: CalendarDays, roles: ["doctor", "secretary"] },
  { href: "/dashboard/billing", label: "Facturación", icon: Receipt, roles: ["doctor", "secretary"] },
  { href: "/dashboard/profile", label: "Perfil", icon: UserCircle, roles: ["doctor"] },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        if (!item.roles.includes(SIMULATED_CURRENT_ROLE)) {
          return null; 
        }

        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href) && !item.isAction);
        
        // Aplicar un estilo sutilmente diferente para los elementos de acción
        // Por ahora, solo aseguramos que no se marquen como 'isActive' de la misma manera que las secciones principales.
        // La diferenciación principal vendrá de su icono y posición.
        const buttonClasses = cn(
          (isActive && !item.isAction) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          item.isAction && "font-normal" // Podríamos hacerlos un poco menos prominentes si no están activos
        );

        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={isActive && !item.isAction} // Solo las secciones principales se marcan como activas visualmente
                tooltip={{ children: item.label, side: "right", align: "center" }}
                className={buttonClasses}
              >
                <a>
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
