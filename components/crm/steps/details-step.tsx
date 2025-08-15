"use client"

import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import type { ProposalData } from "../proposal-drawer"

interface DetailsStepProps {
  data: ProposalData
  onUpdate: (updates: Partial<ProposalData>) => void
}

export function DetailsStep({ data, onUpdate }: DetailsStepProps) {
  // Set default currency on mount if not already set
  useEffect(() => {
    if (!data.currency) {
      onUpdate({ currency: "GBP" })
    }
  }, [data.currency, onUpdate])

  const templates = [
    {
      id: "residential-design",
      name: "Residential Design Package",
      description: "Complete interior design for residential spaces",
    },
    {
      id: "commercial-fitout",
      name: "Commercial Fit-out",
      description: "Office and retail space design and implementation",
    },
    { id: "consultation", name: "Design Consultation", description: "Professional design advice and recommendations" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-greige-50 rounded-lg border border-borderSoft">
        <div className="w-10 h-10 bg-clay-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-clay-600" />
        </div>
        <div>
          <h3 className="font-semibold text-ink">Project Details</h3>
          <p className="text-sm text-ink-muted">Basic information about this proposal</p>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-ink">Quick Start Templates</Label>
        <div className="grid grid-cols-1 gap-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer border-borderSoft bg-white hover:bg-greige-50 transition-colors"
              onClick={() => onUpdate({ title: template.name })}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-greige-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-ink-muted" />
                  </div>
                  <div>
                    <h4 className="font-medium text-ink">{template.name}</h4>
                    <p className="text-sm text-ink-muted">{template.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-ink">
            Proposal Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            placeholder="e.g., Chelsea Penthouse Interior Design"
            value={data.title || ""}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="bg-white border-borderSoft focus:ring-0 focus:border-clay-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency" className="text-sm font-medium text-ink">
            Currency
          </Label>
          <Select value={data.currency || "GBP"} onValueChange={(value) => onUpdate({ currency: value })}>
            <SelectTrigger className="bg-white border-borderSoft focus:ring-0 focus:border-clay-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-borderSoft">
              <SelectItem value="GBP" className="focus:bg-greige-50 focus:text-ink">
                GBP (£)
              </SelectItem>
              <SelectItem value="USD" className="focus:bg-greige-50 focus:text-ink">
                USD ($)
              </SelectItem>
              <SelectItem value="EUR" className="focus:bg-greige-50 focus:text-ink">
                EUR (€)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="validUntil" className="text-sm font-medium text-ink">
            Valid Until <span className="text-red-500">*</span>
          </Label>
          <Input
            id="validUntil"
            type="date"
            value={data.validUntil || ""}
            onChange={(e) => onUpdate({ validUntil: e.target.value })}
            className="bg-white border-borderSoft focus:ring-0 focus:border-clay-300"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-ink">Project Timeline</Label>
          <Select>
            <SelectTrigger className="bg-white border-borderSoft focus:ring-0 focus:border-clay-300">
              <SelectValue placeholder="Select timeline..." />
            </SelectTrigger>
            <SelectContent className="bg-white border-borderSoft">
              <SelectItem value="4-6-weeks" className="focus:bg-greige-50 focus:text-ink">
                4-6 weeks
              </SelectItem>
              <SelectItem value="8-12-weeks" className="focus:bg-greige-50 focus:text-ink">
                8-12 weeks
              </SelectItem>
              <SelectItem value="3-6-months" className="focus:bg-greige-50 focus:text-ink">
                3-6 months
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-medium text-ink">
          Cover Message
        </Label>
        <Textarea
          id="message"
          placeholder="Personal message to include with this proposal..."
          value={data.message || ""}
          onChange={(e) => onUpdate({ message: e.target.value })}
          className="bg-white border-borderSoft focus:ring-0 focus:border-clay-300 min-h-[100px]"
        />
      </div>
    </div>
  )
}
