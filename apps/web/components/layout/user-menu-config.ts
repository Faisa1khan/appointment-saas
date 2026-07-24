import { Capability } from "@/lib/capabilities"

export type UserMenuItemConfig = {
  id: string
  translationKey: string
  capability: Capability
}

export const USER_MENU_GROUPS: UserMenuItemConfig[][] = [
  [
    {
      id: 'myProfile',
      translationKey: 'myProfile',
      capability: 'user:profile'
    },
    {
      id: 'organizationSettings',
      translationKey: 'organizationSettings',
      capability: 'organization:settings'
    },
    {
      id: 'keyboardShortcuts',
      translationKey: 'keyboardShortcuts',
      capability: 'shortcuts'
    },
    {
      id: 'helpAndDocumentation',
      translationKey: 'helpAndDocumentation',
      capability: 'help'
    },
  ],
  [
    {
      id: 'switchOrganization',
      translationKey: 'switchOrganization',
      capability: 'organization:switch'
    },
  ]
]
