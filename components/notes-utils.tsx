import { cn } from "@/lib/utils"
import { Smartphone, Upload, Video } from "lucide-react"
import type { NoteSource, NoteStatus, NoteLink } from "./notes-types"
import { StatusBadge } from "@/components/chip"

export function SourceIcon({ source, className }: { source: NoteSource; className?: string }) {
  const base = "h-4 w-4 text-neutral-600"
  switch (source) {
    case "zoom":
      return <Video className={cn(base, className)} aria-hidden="true" />
    case "mobile":
      return <Smartphone className={cn(base, className)} aria-hidden="true" />
    case "upload":
      return <Upload className={cn(base, className)} aria-hidden="true" />
    default:
      return <Upload className={cn(base, className)} aria-hidden="true" />
  }
}

export function NoteStatusPill({ status }: { status: NoteStatus }) {
  // Map to your global chip system with icon + text
  const label = status === "needs_review" ? "Needs review" : "Published"
  return <StatusBadge status={label} label={label} withIcon />
}

export function LinkedChips({ links }: { links: NoteLink[] }) {
  if (!links?.length) return <span className="text-xs text-neutral-500">—</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {links.map((l, i) => (
        <span
          key={(l.id ?? l.label ?? l.type) + i}
          className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700"
        >
          {/* Use a simple link glyph via CSS before-screenreader announces content in text */}
          <span className="sr-only">Linked: </span>
          {l.label ?? l.type}
        </span>
      ))}
    </div>
  )
}

export function formatRelative(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const h = Math.floor(diffMs / (1000 * 60 * 60))
  if (h < 1) return "Just now"
  if (h < 24) return `${h}h ago`
  if (h < 48) return "Yesterday"
  return d.toLocaleDateString("en-GB", { month: "short", day: "numeric" })
}
