"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, AlertCircle, Eye, Mail } from "lucide-react"
import type { ProposalData } from "../proposal-drawer"

interface ReviewStepProps {
  data: ProposalData
  onUpdate: (updates: Partial<ProposalData>) => void
}

export function ReviewStep({ data, onUpdate }: ReviewStepProps) {
  const validationChecks = [
    { key: "client", label: "Client selected", valid: !!data.client },
    { key: "contact", label: "Contact person assigned", valid: !!data.contact },
    { key: "title", label: "Proposal title provided", valid: !!data.title },
    { key: "scope", label: "Scope of work defined", valid: !!data.scope },
    { key: "pricing", label: "Line items added", valid: !!data.lineItems?.length },
    { key: "terms", label: "Terms & conditions included", valid: !!data.terms },
  ]

  const allValid = validationChecks.every((check) => check.valid)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-greige-50 rounded-lg border border-borderSoft">
        <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-sage-600" />
        </div>
        <div>
          <h3 className="font-semibold text-ink">Review & Send</h3>
          <p className="text-sm text-ink-muted">Final review before sending your proposal</p>
        </div>
      </div>

      {/* Validation Checklist */}
      <Card className="border-borderSoft bg-white">
        <CardHeader>
          <CardTitle className="text-base font-medium text-ink">Proposal Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {validationChecks.map((check) => (
            <div key={check.key} className="flex items-center gap-3">
              {check.valid ? (
                <CheckCircle2 className="w-5 h-5 text-sage-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              <span className={`text-sm ${check.valid ? "text-ink" : "text-amber-600"}`}>{check.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Proposal Summary */}
      <Card className="border-borderSoft bg-white">
        <CardHeader>
          <CardTitle className="text-base font-medium text-ink">Proposal Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-ink-muted">Client:</span>
              <p className="font-medium text-ink">{data.client || "Not selected"}</p>
            </div>
            <div>
              <span className="text-ink-muted">Contact:</span>
              <p className="font-medium text-ink">{data.contact || "Not assigned"}</p>
            </div>
            <div>
              <span className="text-ink-muted">Title:</span>
              <p className="font-medium text-ink">{data.title || "Untitled Proposal"}</p>
            </div>
            <div>
              <span className="text-ink-muted">Valid Until:</span>
              <p className="font-medium text-ink">{data.validUntil || "Not set"}</p>
            </div>
          </div>

          {data.total && (
            <>
              <Separator className="bg-borderSoft" />
              <div className="flex justify-between items-center">
                <span className="text-ink-muted">Total Value:</span>
                <span className="text-xl font-semibold text-ink">£{data.total.toLocaleString()}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Preview & Send Options */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-borderSoft bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-greige-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-ink-muted" />
              </div>
              <div>
                <h4 className="font-medium text-ink">PDF Preview</h4>
                <p className="text-sm text-ink-muted">Review before sending</p>
              </div>
            </div>
            <Button variant="outline" className="w-full border-borderSoft bg-white hover:bg-greige-50">
              <Eye className="w-4 h-4 mr-2" />
              Preview PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="border-borderSoft bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-greige-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-ink-muted" />
              </div>
              <div>
                <h4 className="font-medium text-ink">Test Email</h4>
                <p className="text-sm text-ink-muted">Send to yourself first</p>
              </div>
            </div>
            <Button variant="outline" className="w-full border-borderSoft bg-white hover:bg-greige-50">
              <Mail className="w-4 h-4 mr-2" />
              Send Test
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Send Options */}
      <Card className="border-borderSoft bg-white">
        <CardHeader>
          <CardTitle className="text-base font-medium text-ink">Send Proposal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sendTo" className="text-sm font-medium text-ink">
                Send to
              </Label>
              <Input
                id="sendTo"
                placeholder="client@example.com"
                className="bg-white border-borderSoft focus:ring-0 focus:border-clay-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cc" className="text-sm font-medium text-ink">
                CC (optional)
              </Label>
              <Input
                id="cc"
                placeholder="team@yourcompany.com"
                className="bg-white border-borderSoft focus:ring-0 focus:border-clay-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-greige-50 rounded-lg border border-borderSoft">
            {allValid ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-sage-500" />
                <span className="text-sm text-sage-700">Proposal is ready to send</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span className="text-sm text-amber-700">Please complete all required fields</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
