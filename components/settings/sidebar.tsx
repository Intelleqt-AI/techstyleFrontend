"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type Item = {
  label: string
  href: string
}

const userItems: Item[] = [
  { label: "Profile", href: "/settings/user/profile" },
  { label: "Security", href: "/settings/user/security" },
  { label: "Notifications", href: "/settings/user/notifications" },
  { label: "Appearance", href: "/settings/user/appearance" },
]

const studioItems: Item[] = [
  { label: "General", href: "/settings/studio/general" },
  { label: "Branding", href: "/settings/studio/branding" },
  { label: "Finance", href: "/settings/studio/finance" },
  { label: "Integrations", href: "/settings/studio/integrations" },
  { label: "Team", href: "/settings/studio/team" },
  { label: "Templates", href: "/settings/studio/templates" },
  { label: "Roles & Permissions", href: "/settings/studio/roles" },
  { label: "API & Webhooks", href: "/settings/studio/api" },
  { label: "Audit Logs", href: "/settings/studio/audit-logs" },
]

function Section({ title, items }: { title: string; items: Item[] }) {
  const pathname = usePathname()
  return (
    <div className="space-y-1">
      <div className="px-3 pt-4 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</div>
      <nav className="grid">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm rounded-md transition-colors",
                active
                  ? "bg-neutral-100 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-neutral-50",
              )}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default function SettingsSidebar() {
  return (
    <div className="h-full w-full overflow-y-auto p-2">
      <Section title="User" items={userItems} />
      <div className="my-2 border-t" />
      <Section title="Studio" items={studioItems} />
    </div>
  )
}
