
// src/components/layout/SidebarNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, CalendarDays, Receipt, UserCircle, FileSignature, Stethoscope, PlusCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { SIMULATED_CURRENT_ROLE } from '@/lib/mock-data'; // Importar el rol simulado

const navItemsBase = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard, roles: ["doctor", "secretary"] },
  { href: "/dashboard/patients", label: "Pacientes", icon: Users, roles: ["doctor", "secretary"] },
  // Acciones directas para médicos:
  { href: "/dashboard/consultations/new", label: "Nueva Consulta", icon: Stethoscope, roles: ["doctor"], isAction: true },
  { href: "/dashboard/recipes/new", label: "Nueva Receta", icon: PlusCircle, roles: ["doctor"], isAction: true },
  // Secciones principales restantes:
  { href: "/dashboard/schedule", label: "Agenda", icon: CalendarDays, roles: ["doctor", "secretary"] },
  { href: "/dashboard/billing", label: "Facturación", icon: Receipt, roles: ["doctor", "secretary"] },
  { href: "/dashboard/profile", label: "Perfil Médico", icon: UserCircle, roles: ["doctor"] },
  // Nueva sección para gestión de usuarios (solo para médico)
  { href: "/dashboard/admin/users", label: "Gestión Usuarios", icon: Settings, roles: ["doctor"] },
];

export function SidebarNav() {
  const pathname = usePathname();

  // Usar el rol simulado para filtrar los items de navegación
  const visibleNavItems = navItemsBase.filter(item => item.roles.includes(SIMULATED_CURRENT_ROLE));

  return (
    <SidebarMenu>
      {visibleNavItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href) && !item.isAction);
        
        const buttonClasses = cn(
          (isActive && !item.isAction) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          item.isAction && "font-normal" 
        );

        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={isActive && !item.isAction} 
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
