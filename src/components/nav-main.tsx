"use client";

import { CircleGauge, MessageSquare } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/dashboard">
              <CircleGauge />
              <span>Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/chat">
              <MessageSquare />
              <span>Chat</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
