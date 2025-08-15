"use client"

import { usePathname } from "next/navigation"
import { NavPills } from "@/components/shared/nav-pills"

/**
 * Library nav — order and routes preserved.
 * Only styling is unified to exactly match Projects.
 */
export function LibraryNav() {
  const pathname = usePathname()

  const items = [
    { label: "Products", href: "/library/products" },
    { label: "Materials", href: "/library/materials" },
  ]

  return <NavPills items={items} activeHref={pathname} />
}
