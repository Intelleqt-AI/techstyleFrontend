"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home,
  Users,
  FolderOpen,
  BookOpen,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

type Item = {
  label: string
  icon: any
  href: string
  basePath: string
}

// Base list without Settings to avoid duplicates in the main nav.
// Settings will live only in the footer utility area.
const baseSidebarItems: Item[] = [
  { label: "Home", icon: Home, href: "/home/dashboard", basePath: "/home" },
  { label: "CRM", icon: Users, href: "/crm", basePath: "/crm" },
  { label: "Projects", icon: FolderOpen, href: "/projects", basePath: "/projects" },
  { label: "Library", icon: BookOpen, href: "/library", basePath: "/library" },
  { label: "Calendar", icon: Calendar, href: "/calendar/studio", basePath: "/calendar" },
  { label: "Finance", icon: DollarSign, href: "/finance", basePath: "/finance" },
  { label: "Reports", icon: BarChart3, href: "/reports", basePath: "/reports" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Defensive: if any "Settings" slipped in via a future merge, filter it out.
  const sidebarItems = useMemo(() => baseSidebarItems.filter((i) => i.label.toLowerCase() !== "settings"), [])

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Logo */}
      <div className={cn("p-4 bg-white", isCollapsed && "px-2")}>
        <div className="flex items-center gap-2">
          <img
            src="/brand/techstyles-t-logo.png"
            alt="Techstyles logo mark"
            className={cn(isCollapsed ? "w-12 h-12 mx-auto" : "w-8 h-8", "block")}
          />
          {!isCollapsed && <span className="font-semibold text-gray-900">Techstyles</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-1 bg-white", isCollapsed ? "px-2 py-4" : "p-4")}>
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.basePath)

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                isCollapsed ? "justify-center p-3 w-12 h-12 mx-auto" : "gap-3 px-3 py-2",
                isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={cn(isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
              {!isCollapsed && item.label}
            </Link>
          )
        })}

        {/* Collapse/Expand Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex items-center rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors",
            isCollapsed ? "justify-center p-3 w-12 h-12 mx-auto" : "gap-3 px-3 py-2 w-full justify-start",
          )}
          title={isCollapsed ? (isCollapsed ? "Expand" : "Collapse") : undefined}
        >
          {isCollapsed ? (
            <ChevronRight className="w-6 h-6" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              Collapse
            </>
          )}
        </Button>
      </nav>

      {/* Utility Links + User Profile */}
      <div className={cn("p-4 bg-white", isCollapsed && "px-2")}>
        {!isCollapsed && (
          <div className="space-y-1 mb-4">
            <Link
              href="/help"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              {/* simple help icon path to avoid extra deps */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Help Center
            </Link>
            {/* Settings only here, not in the main list */}
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </div>
        )}

        {/* User Profile Card */}
        <div className={cn("bg-gray-900 rounded-xl", isCollapsed ? "p-2" : "p-3")}>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "bg-white rounded-full flex items-center justify-center flex-shrink-0",
                isCollapsed ? "w-12 h-12 mx-auto" : "w-10 h-10",
              )}
            >
              <span className={cn("text-gray-900 font-semibold", isCollapsed ? "text-base" : "text-sm")}>J</span>
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">Jane Designer</p>
                  <p className="text-gray-400 text-xs truncate">jane@techstyles.com</p>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
