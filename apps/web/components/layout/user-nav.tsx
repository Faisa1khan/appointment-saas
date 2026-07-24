"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut } from "lucide-react"
import { logout } from "@/app/actions/auth"
import { useRouter } from "next/navigation"

import { useTranslations } from "next-intl"
import { hasCapability } from "@/lib/capabilities"
import React from "react"
import { USER_MENU_GROUPS } from "./user-menu-config"

export function UserNav({
  name,
  email
}: {
  name: string
  email: string
}) {
  const router = useRouter()
  const t = useTranslations("common.userNav")

  const handleLogout = async () => {
    await logout()
    router.push('/login')
    router.refresh()
  }

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const visibleGroups = USER_MENU_GROUPS
    .map(group => group.filter(item => hasCapability(item.capability)))
    .filter(group => group.length > 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative h-8 w-8 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        
        {visibleGroups.map((group, groupIndex) => (
          <React.Fragment key={`group-${groupIndex}`}>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {group.map(item => (
                <DropdownMenuItem key={item.id}>
                  <span>{t(item.translationKey)}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </React.Fragment>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20 dark:focus:text-destructive cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
