"use client"

import type * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Props = {
  title?: string
  description?: string
  className?: string
  children?: React.ReactNode
}

export function ChartCard({ title = "Chart", description = "", className = "", children = null }: Props) {
  return (
    <Card className={cn("border-gray-200 bg-white", className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold text-gray-900">{title}</CardTitle>
        {description ? <CardDescription className="text-gray-600">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )
}
