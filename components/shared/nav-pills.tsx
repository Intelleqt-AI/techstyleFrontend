"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

export type NavPillItem = {
  label: string
  href: string
  count?: number
}

export type NavPillsProps = {
  items: NavPillItem[]
  activeHref: string
  className?: string
}

/**
 * Shared pill nav that matches the Projects page style EXACTLY.
 * - Container: bg-white border border-gray-200 rounded-xl p-2
 * - Pills: text-sm, font-normal, px-4 py-2, rounded-lg
 * - Active: bg-neutral-100 text-gray-900
 * - Inactive: text-gray-700 hover:bg-neutral-50
 * - Count chip: small clay badge
 */
export function NavPills({ items, activeHref, className }: NavPillsProps) {
  return (
    <div className={cn("bg-white border border-gray-200 rounded-xl p-2", className)}>
      <nav className="flex items-center gap-2 overflow-x-auto" aria-label="Section navigation">
        {items.map((item) => {
          const isActive = activeHref === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-normal transition-colors",
                isActive ? "bg-neutral-100 text-gray-900" : "text-gray-700 hover:bg-neutral-50",
              )}
            >
              <span>{item.label}</span>
              {typeof item.count === "number" && item.count > 0 ? (
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[11px] font-medium text-white bg-clay-500">
                  {item.count}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
