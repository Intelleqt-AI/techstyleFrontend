"use client"

import { useState, useEffect } from "react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { ClientBrandingStep } from "./steps/client-branding-step"
import { DetailsStep } from "./steps/details-step"
import { ScopeStep } from "./steps/scope-step"
import { PricingStep } from "./steps/pricing-step"
import { TermsStep } from "./steps/terms-step"
import { ReviewStep } from "./steps/review-step"

export type ProposalStep = "client" | "details" | "scope" | "pricing" | "terms" | "review"

export interface ProposalData {
  id?: string
  client?: string
  contact?: string
  branding?: string
  title?: string
  currency?: string
  validUntil?: string
  scope?: string
  lineItems?: Array<{
    id: string
    description: string
    quantity: number
    rate: number
    amount: number
  }>
  subtotal?: number
  tax?: number
  total?: number
  terms?: string
  message?: string
}

interface ProposalDrawerProps {
  open: boolean
  onClose: () => void
  initialData?: Partial<ProposalData>
}

const steps: Array<{ key: ProposalStep; label: string; required: boolean }> = [
  { key: "client", label: "Client & Branding", required: true },
  { key: "details", label: "Details", required: true },
  { key: "scope", label: "Scope", required: true },
  { key: "pricing", label: "Pricing", required: true },
  { key: "terms", label: "Terms", required: true },
  { key: "review", label: "Review", required: false },
]

export function ProposalDrawer({ open, onClose, initialData }: ProposalDrawerProps) {
  const [currentStep, setCurrentStep] = useState<ProposalStep>("client")
  const [data, setData] = useState<ProposalData>(initialData || {})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const timer = setTimeout(async () => {
      setIsSaving(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setHasUnsavedChanges(false)
      setIsSaving(false)

      const now = new Date()
      const timeString = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })

      toast({
        description: `Saved · ${timeString}`,
        duration: 2000,
      })
    }, 2000)

    return () => clearTimeout(timer)
  }, [hasUnsavedChanges])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleSave()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        if (canSend()) {
          handleSend()
        }
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, data])

  const updateData = (updates: Partial<ProposalData>) => {
    setData((prev) => ({ ...prev, ...updates }))
    setHasUnsavedChanges(true)
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    setHasUnsavedChanges(false)
    setIsSaving(false)
    toast({
      description: "Proposal saved as draft",
      duration: 2000,
    })
  }

  const handlePreview = () => {
    toast({
      description: "Opening PDF preview...",
      duration: 2000,
    })
  }

  const handleSend = async () => {
    if (!canSend()) return

    toast({
      description: "Sending proposal...",
      duration: 2000,
    })

    // Simulate send
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      description: "Proposal sent successfully!",
      duration: 3000,
    })

    onClose()
  }

  const canSend = () => {
    return !!(data.client && data.contact && data.title && data.lineItems?.length && data.terms)
  }

  const isStepValid = (step: ProposalStep) => {
    switch (step) {
      case "client":
        return !!(data.client && data.contact)
      case "details":
        return !!(data.title && data.currency && data.validUntil)
      case "scope":
        return !!data.scope
      case "pricing":
        return !!(data.lineItems?.length && data.total)
      case "terms":
        return !!data.terms
      case "review":
        return true
      default:
        return false
    }
  }

  const canProceedToStep = (step: ProposalStep) => {
    const stepIndex = steps.findIndex((s) => s.key === step)
    const currentIndex = steps.findIndex((s) => s.key === currentStep)

    if (stepIndex <= currentIndex) return true

    // Check if all previous required steps are valid
    for (let i = 0; i < stepIndex; i++) {
      const prevStep = steps[i]
      if (prevStep.required && !isStepValid(prevStep.key)) {
        return false
      }
    }

    return true
  }

  const nextStep = () => {
    const currentIndex = steps.findIndex((s) => s.key === currentStep)
    if (currentIndex < steps.length - 1) {
      const nextStepKey = steps[currentIndex + 1].key
      if (canProceedToStep(nextStepKey)) {
        setCurrentStep(nextStepKey)
      }
    }
  }

  const prevStep = () => {
    const currentIndex = steps.findIndex((s) => s.key === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case "client":
        return <ClientBrandingStep data={data} onUpdate={updateData} />
      case "details":
        return <DetailsStep data={data} onUpdate={updateData} />
      case "scope":
        return <ScopeStep data={data} onUpdate={updateData} />
      case "pricing":
        return <PricingStep data={data} onUpdate={updateData} />
      case "terms":
        return <TermsStep data={data} onUpdate={updateData} />
      case "review":
        return <ReviewStep data={data} onUpdate={updateData} />
      default:
        return null
    }
  }

  const getCurrentStepNumber = () => {
    return steps.findIndex((s) => s.key === currentStep) + 1
  }

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)
  const canGoNext = currentStepIndex < steps.length - 1 && isStepValid(currentStep)
  const canGoPrev = currentStepIndex > 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-borderSoft">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl font-semibold text-ink">Create new proposal</DialogTitle>
              {isSaving && (
                <Badge variant="secondary" className="text-xs">
                  Saving...
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer ${
                  index + 1 === getCurrentStepNumber()
                    ? "bg-clay-600 text-white"
                    : index + 1 < getCurrentStepNumber()
                      ? "bg-sage-500 text-white"
                      : "bg-greige-200 text-ink-muted"
                }`}
                onClick={() => {
                  if (canProceedToStep(step.key)) {
                    setCurrentStep(step.key)
                  }
                }}
              >
                {index + 1 < getCurrentStepNumber() ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-2 ${index + 1 < getCurrentStepNumber() ? "bg-sage-500" : "bg-greige-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">{renderStep()}</div>

        <Separator className="bg-borderSoft" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose} className="border-borderSoft bg-white hover:bg-greige-50">
              Cancel
            </Button>
            {canGoPrev && (
              <Button variant="outline" onClick={prevStep} className="border-borderSoft bg-white hover:bg-greige-50">
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {data.total && (
              <div className="text-sm font-medium text-ink tabular-nums mr-4">
                Total: £{data.total.toLocaleString()}
              </div>
            )}

            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
              className="border-borderSoft bg-white hover:bg-greige-50"
            >
              Save Draft
            </Button>

            <Button variant="outline" onClick={handlePreview} className="border-borderSoft bg-white hover:bg-greige-50">
              Preview
            </Button>

            {canGoNext ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="bg-clay-600 hover:bg-clay-700 text-white"
              >
                Continue
              </Button>
            ) : (
              <Button onClick={handleSend} disabled={!canSend()} className="bg-clay-600 hover:bg-clay-700 text-white">
                Send Proposal
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
