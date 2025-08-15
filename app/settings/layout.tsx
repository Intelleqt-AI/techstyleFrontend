"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import SettingsSidebar from '@/components/settings/sidebar'
import { User, Shield, Bell, Palette, Building2, DollarSign, PlugZap, Users, KeyRound, ScrollText, ImageIcon } from 'lucide-react'

type NavItem = {
  title: string
  href: string
  icon: any
  badge?: string
}

const userNav: NavItem[] = [
  { title: "Profile", href: "/settings/user/profile", icon: User },
  { title: "Security", href: "/settings/user/security", icon: Shield },
  { title: "Notifications", href: "/settings/user/notifications", icon: Bell },
  { title: "Appearance", href: "/settings/user/appearance", icon: Palette },
]

const studioNav: NavItem[] = [
  { title: "General", href: "/settings/studio/general", icon: Building2 },
  { title: "Branding", href: "/settings/studio/branding", icon: ImageIcon },
  { title: "Finance", href: "/settings/studio/finance", icon: DollarSign },
  { title: "Integrations", href: "/settings/studio/integrations", icon: PlugZap, badge: "New" },
  { title: "Team", href: "/settings/studio/team", icon: Users },
  { title: "Roles & Permissions", href: "/settings/studio/roles", icon: Shield },
  { title: "API & Webhooks", href: "/settings/studio/api", icon: KeyRound },
  { title: "Audit Logs", href: "/settings/studio/audit-logs", icon: ScrollText },
]

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-[calc(100vh-64px)] bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] gap-4 md:gap-8">
          <aside className="rounded-lg border bg-white">
            <SettingsSidebar />
          </aside>
          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
