"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { LayoutDashboard, Scissors, Users } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const t = useTranslations("common.brand")
  const { setOpenMobile, isMobile } = useSidebar()

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex h-14 items-center px-4 font-bold text-xl text-primary">
          {t("name")}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/app" onClick={handleNavClick} />} size="lg">
                    <LayoutDashboard className="size-5" />
                    <span className="text-base font-medium">Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/app/services" onClick={handleNavClick} />} size="lg">
                    <Scissors className="size-5" />
                    <span className="text-base font-medium">Services</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/app/staff" onClick={handleNavClick} />} size="lg">
                    <Users className="size-5" />
                    <span className="text-base font-medium">Staff</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
