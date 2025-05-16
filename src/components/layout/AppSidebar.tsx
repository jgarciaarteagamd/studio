// src/components/layout/AppSidebar.tsx
"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { SidebarNav } from "./SidebarNav";
import { ActivitySquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AppSidebar() {
  return (
    <Sidebar side="left" collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <ActivitySquare className="h-8 w-8 text-primary" />
          <span className="text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            EndoCloud Notes
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarNav />
      </SidebarContent>
      <SidebarFooter className="p-2">
        <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center">
          <LogOut className="mr-2 h-5 w-5 group-data-[collapsible=icon]:mr-0" />
          <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
