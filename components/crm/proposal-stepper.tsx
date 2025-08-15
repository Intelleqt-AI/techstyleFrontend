"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProposalStep } from "./proposal-drawer"

interface Step {
  key: ProposalStep
  label: string
  required: boolean
}

interface ProposalStepperProps {
  steps: Step[]
  currentStep: ProposalStep
  onStepClick: (step: ProposalStep) => void
  isStepValid: (step: ProposalStep) => boolean
  canProceedToStep: (step: ProposalStep) => boolean
}

export function ProposalStepper({
  steps,
  currentStep,
  onStepClick,
  isStepValid,
  canProceedToStep,
}: ProposalStepperProps) {
  return (
    <nav className="flex items-center space-x-4 mt-4">
      {steps.map((step, index) => {
        const isCurrent = step.key === currentStep
        const isValid = isStepValid(step.key)
        const canProceed = canProceedToStep(step.key)
        const isClickable = canProceed

        return (
          <div key={step.key} className="flex items-center">
            <button
              onClick={() => isClickable && onStepClick(step.key)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isCurrent && "bg-gray-50 text-gray-700",
                !isCurrent && isValid && "text-green-700 hover:bg-green-50",
                !isCurrent && !isValid && canProceed && "text-gray-600 hover:bg-gray-50",
                !canProceed && "text-gray-400 cursor-not-allowed",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                  isCurrent && "bg-gray-900 text-white",
                  !isCurrent && isValid && "bg-green-600 text-white",
                  !isCurrent && !isValid && canProceed && "bg-gray-200 text-gray-600",
                  !canProceed && "bg-gray-100 text-gray-400",
                )}
              >
                {!isCurrent && isValid ? <Check className="w-3 h-3" /> : index + 1}
              </div>

              <span className="whitespace-nowrap">
                {step.label}
                {step.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </button>

            {index < steps.length - 1 && <div className="w-8 h-px bg-gray-200 mx-2" />}
          </div>
        )
      })}
    </nav>
  )
}
