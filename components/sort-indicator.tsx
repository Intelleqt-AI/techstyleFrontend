"use client"

import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'

type Props = {
  direction?: "asc" | "desc" | null
  className?: string
}

export function SortIndicator({ direction = null, className }: Props) {
  if (direction === "asc") return <ChevronUp className={`h-3.5 w-3.5 ${className ?? ""}`} />
  if (direction === "desc") return <ChevronDown className={`h-3.5 w-3.5 ${className ?? ""}`} />
  return <ChevronsUpDown className={`h-3.5 w-3.5 text-gray-400 ${className ?? ""}`} />
}
