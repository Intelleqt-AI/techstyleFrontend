import { cn } from "@/lib/utils"

export function AIPill({ className }: { className?: string }) {
  // Small AI indicator using the same rectangular rounded-md chip shape
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-greige-500 bg-greige-100 px-1.5 py-0 text-[10px] font-medium leading-4 text-taupe-700 shadow-sm",
        className,
      )}
      aria-label="AI generated"
      title="AI generated"
    >
      {"AI"}
    </span>
  )
}
