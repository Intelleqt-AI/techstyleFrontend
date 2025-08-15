"use client"

import { usePathname } from "next/navigation"
import { NavPills } from "@/components/shared/nav-pills"

/**
 * CRM nav — order and routes preserved.
 * Only styling is unified to exactly match Projects.
 */
export function CrmNav() {
  const pathname = usePathname()

  const items = [
    { label: "Contacts", href: "/crm/contacts" },
    { label: "Leads", href: "/crm/leads", count: 2 },
    { label: "Sales Pipeline", href: "/crm/pipeline" },
    { label: "Proposals", href: "/crm/proposals" },
  ]

  return <NavPills items={items} activeHref={pathname} />
}
