import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

// Reusable section wrapper for Settings pages.
// - White card, rounded-xl, soft border, consistent padding
// - Title + optional description on the left, optional action on the right
// - Children content area with spacing
export function SettingsSection({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn("bg-white border border-gray-200 rounded-xl", className)}>
      <div className="flex items-start justify-between gap-4 p-4 sm:p-5 border-b border-gray-200">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}

// Alias to support older imports: { Section } from "@/components/settings/section"
export const Section = SettingsSection

export default SettingsSection
