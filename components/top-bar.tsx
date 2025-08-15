"use client"

import type React from "react"

import { Bell, History, Plus, Search, Command } from "lucide-react"
import { Input } from "@/components/ui/input"
import { BreadcrumbBar } from "@/components/breadcrumb-bar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "neutral" | "notify" | "activity" | "primary"
  isOpen?: boolean
}

const IconButton = ({ children, variant = "neutral", className, isOpen = false, ...props }: IconButtonProps) => {
  const base =
    "w-11 h-11 flex items-center justify-center rounded-[12px] transition-all duration-200 relative focus-visible:outline-none focus-visible:ring-2"
  const variants: Record<NonNullable<IconButtonProps["variant"]>, string> = {
    // neutral greige chip
    neutral: "bg-greige-100 hover:bg-greige-300 text-slatex-700 focus-visible:ring-greige-500/40",
    // notifications use clay tint
    notify: cn("bg-clay-50 hover:bg-clay-100 text-ink focus-visible:ring-clay-300", isOpen && "translate-y-0.5"),
    // activity uses subtle neutral tint
    activity: cn(
      "bg-neutral-50 hover:bg-neutral-100 text-ink focus-visible:ring-neutral-300",
      isOpen && "translate-y-0.5",
    ),
    // primary action uses deep navy
    primary: cn(
      "bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-neutral-200",
      isOpen && "translate-y-0.5",
    ),
  }
  return (
    <button className={cn(base, variants[variant], className)} data-state={isOpen ? "open" : "closed"} {...props}>
      {children}
    </button>
  )
}

export function TopBar() {
  return (
    <header className="h-14 bg-white flex items-center justify-between px-6 border-b border-gray-200">
      <div className="flex items-center gap-6 flex-1">
        <BreadcrumbBar />

        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search or ask AI..." className="pl-10 pr-16 bg-neutral-50 text-sm h-9 w-full" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs px-2 py-1 rounded bg-greige-100 text-taupe-700">
              <Command className="w-3 h-3" />K
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mr-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <IconButton variant="notify" aria-label="Notifications">
                <Bell className="w-5 h-5 stroke-[1.75]" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-clay-500" />
              </IconButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <IconButton variant="activity" aria-label="Activity Log">
                <History className="w-5 h-5 stroke-[1.75]" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-slatex-500" />
              </IconButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>Activity Log</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <IconButton variant="primary" aria-label="Quick actions">
                    <Plus className="w-5 h-5 stroke-[1.75]" />
                  </IconButton>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quick Add</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenuContent className="w-56 bg-white border border-borderSoft shadow-lg" align="end">
              <DropdownMenuItem className="flex items-center gap-2 hover:bg-neutral-50 focus:bg-neutral-50">
                Task
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 hover:bg-neutral-50 focus:bg-neutral-50">
                Meeting
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 hover:bg-neutral-50 focus:bg-neutral-50">
                AI Note
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 hover:bg-neutral-50 focus:bg-neutral-50">
                Purchase Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>
      </div>
    </header>
  )
}
