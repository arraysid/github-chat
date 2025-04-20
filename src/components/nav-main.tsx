"use client";

import { CircleGauge, MessageSquare } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <CircleGauge />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton>
            <MessageSquare />
            <span>Chat</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
