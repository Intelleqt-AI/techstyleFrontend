"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Building, Store } from "lucide-react"
import type { ProposalData } from "../proposal-drawer"

interface TermsStepProps {
  data: ProposalData
  onUpdate: (updates: Partial<ProposalData>) => void
}

export function TermsStep({ data, onUpdate }: TermsStepProps) {
  const termsTemplates = [
    {
      id: "residential",
      name: "Residential Terms",
      icon: Building,
      content: `TERMS & CONDITIONS

1. SCOPE OF WORK
The Designer agrees to provide interior design services as outlined in the project scope.

2. PAYMENT TERMS
Payment is due according to the schedule outlined in this proposal. Late payments may incur a 1.5% monthly service charge.

3. CHANGES & REVISIONS
Minor revisions are included. Major changes may require additional fees and timeline adjustments.

4. TIMELINE
Project timeline is estimated and subject to client approvals, product availability, and contractor schedules.

5. CANCELLATION
Either party may terminate with 30 days written notice. Client is responsible for work completed to date.

6. LIABILITY
Designer's liability is limited to the total contract value. Designer is not responsible for structural modifications.`,
    },
    {
      id: "commercial",
      name: "Commercial Terms",
      icon: Store,
      content: `COMMERCIAL TERMS & CONDITIONS

1. PROJECT SCOPE
Services include space planning, design development, and project coordination as specified.

2. PAYMENT SCHEDULE
Invoices are due within 30 days. Projects may be suspended for overdue payments exceeding 45 days.

3. APPROVALS & PERMITS
Client is responsible for obtaining necessary permits and approvals from relevant authorities.

4. COMPLIANCE
All designs will comply with applicable building codes and accessibility requirements.

5. INTELLECTUAL PROPERTY
Design concepts remain property of Designer until final payment is received.

6. FORCE MAJEURE
Neither party is liable for delays due to circumstances beyond reasonable control.`,
    },
    {
      id: "standard",
      name: "Standard Terms",
      icon: FileText,
      content: `STANDARD TERMS & CONDITIONS

1. SERVICES
Designer will provide professional interior design services as described in this proposal.

2. FEES & PAYMENT
All fees are due as outlined in the payment schedule. Additional services will be billed separately.

3. CLIENT RESPONSIBILITIES
Client will provide timely decisions, approvals, and access to the project site as needed.

4. TIMELINE
Estimated timeline is subject to client approvals and external factors beyond Designer's control.

5. WARRANTY
Designer warrants professional services but not third-party products or contractor work.

6. GOVERNING LAW
This agreement is governed by the laws of England and Wales.`,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-greige-50 rounded-lg border border-borderSoft">
        <div className="w-10 h-10 bg-clay-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-clay-600" />
        </div>
        <div>
          <h3 className="font-semibold text-ink">Terms & Conditions</h3>
          <p className="text-sm text-ink-muted">Legal terms and conditions for this proposal</p>
        </div>
      </div>

      {/* Template Library */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-ink">Template Library</Label>
        <div className="grid grid-cols-1 gap-3">
          {termsTemplates.map((template) => {
            const IconComponent = template.icon
            return (
              <Card
                key={template.id}
                className="cursor-pointer border-borderSoft bg-white hover:bg-greige-50 transition-colors"
                onClick={() => onUpdate({ terms: template.content })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-greige-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-ink-muted" />
                      </div>
                      <div>
                        <h4 className="font-medium text-ink mb-1">{template.name}</h4>
                        <p className="text-sm text-ink-muted">
                          {template.content.split("\n").slice(0, 2).join(" ").substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs bg-white text-ink-muted border-borderSoft">
                      Use Template
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Custom Terms */}
      <div className="space-y-2">
        <Label htmlFor="terms" className="text-sm font-medium text-ink">
          Terms & Conditions <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="terms"
          placeholder="Enter your terms and conditions..."
          value={data.terms || ""}
          onChange={(e) => onUpdate({ terms: e.target.value })}
          className="bg-white border-borderSoft focus:ring-0 focus:border-clay-300 min-h-[300px] font-mono text-sm"
        />
        <p className="text-xs text-ink-muted">
          These terms will appear at the end of your proposal. Ensure they comply with local regulations.
        </p>
      </div>
    </div>
  )
}
