import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2 } from "lucide-react"

type StatusLike =
  | "new"
  | "contacted"
  | "qualified"
  | "lost"
  | "draft"
  | "sent"
  | "under review"
  | "accepted"
  | "rejected"
  | "on-track"
  | "at-risk"
  | "ahead"
  | "out of stock"
  | "overdue"
  | "high"
  | "medium"
  | "low"
  | "ordered"
  | "pending"
  | "delivered"
  | "paid"
  | "approved"
  | "needs review"
  | "published"

const baseChip = "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium leading-none select-none"

// Central mapping for ALL statuses using the earthy palette
function getStatusClasses(status: string) {
  const s = status.toLowerCase().trim() as StatusLike

  switch (s) {
    // CRM Leads
    case "new":
      return "bg-slatex-500/10 text-slatex-700 border-slatex-500/20"
    case "contacted":
      return "bg-ochre-300/20 text-ochre-700 border-ochre-700/20"
    case "qualified":
      return "bg-sage-300/40 text-olive-700 border-olive-700/20"
    case "lost":
      return "bg-terracotta-600/10 text-terracotta-600 border-terracotta-600/30"

    // CRM Proposals
    case "draft":
      return "bg-greige-100 text-taupe-700 border-greige-500"
    case "sent":
      return "bg-slatex-500/10 text-slatex-700 border-slatex-500/20"
    case "under review":
      return "bg-ochre-300/30 text-ochre-700 border-ochre-700/30"
    case "accepted":
      return "bg-sage-300/50 text-olive-700 border-olive-700/20"
    case "rejected":
      return "bg-terracotta-600/10 text-terracotta-600 border-terracotta-600/30"

    // Projects list
    case "on-track":
      return "bg-sage-300/40 text-olive-700 border-olive-700/20"
    case "at-risk":
      return "bg-terracotta-600/10 text-terracotta-600 border-terracotta-600/30"
    case "ahead":
      return "bg-ochre-300/20 text-ochre-700 border-ochre-700/20"

    // Library
    case "out of stock":
      return "bg-terracotta-600/10 text-terracotta-600 border-terracotta-600/30"

    // Tasks priorities
    case "high":
      return "bg-terracotta-600/10 text-terracotta-600 border-terracotta-600/30"
    case "medium":
      return "bg-clay-500/10 text-clay-600 border-clay-500/30"
    case "low":
      return "bg-greige-100 text-taupe-700 border-greige-500"

    // Generic
    case "overdue":
      return "bg-terracotta-600/15 text-terracotta-700 border-terracotta-600/30"

    // Procurement + Finance
    case "delivered":
      return "bg-sage-300/40 text-olive-700 border-olive-700/20"
    case "ordered":
      return "bg-slatex-500/10 text-slatex-700 border-slatex-500/20"
    case "pending":
      return "bg-ochre-300/30 text-ochre-700 border-ochre-700/30"
    case "paid":
      return "bg-sage-300/50 text-olive-700 border-olive-700/20"
    case "approved":
      return "bg-sage-300/50 text-olive-700 border-olive-700/20"

    // Additional cases
    case "needs review":
      return "bg-ochre-300/30 text-ochre-700 border-ochre-700/30"
    case "published":
      return "bg-sage-300/50 text-olive-700 border-olive-700/20"

    default:
      return "bg-neutral-100 text-gray-700 border-gray-200"
  }
}

export function Chip({ label, className }: { label: string; className?: string }) {
  return <span className={cn(baseChip, "bg-neutral-100 text-gray-700 border-gray-200", className)}>{label}</span>
}

export function TypeChip({ label, className }: { label: string; className?: string }) {
  // Neutral earthy type chip for categories/tags
  return <span className={cn(baseChip, "bg-greige-100 text-taupe-700 border-greige-500", className)}>{label}</span>
}

export function StatusBadge({
  status,
  label,
  className,
  withIcon = false,
}: {
  status: string
  label?: string
  className?: string
  withIcon?: boolean
}) {
  const cls = getStatusClasses(status)
  const lower = status.toLowerCase().trim()
  return (
    <span className={cn(baseChip, cls, className)}>
      {withIcon && (
        <>
          {lower === "needs review" ? (
            <AlertCircle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
          ) : lower === "published" ? (
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
          ) : null}
        </>
      )}
      {label ?? status}
    </span>
  )
}
