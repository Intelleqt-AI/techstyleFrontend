"use client"

import { usePathname } from "next/navigation"
import { NavPills } from "@/components/shared/nav-pills"

// Global Home section nav — uses the shared NavPills so spacing, fonts, and
// active styles are identical across all Home pages and do not "move" per tab.
export function HomeNav() {
  const pathname = usePathname()

  const items = [
    { label: "Dashboard", href: "/home/dashboard" },
    { label: "My Tasks", href: "/home/tasks" },
    { label: "My Inbox", href: "/home/inbox" },
    { label: "Calendar", href: "/home/calendar" },
    { label: "Time", href: "/home/time" },
  ]

  return <NavPills items={items} activeHref={pathname} />
}
