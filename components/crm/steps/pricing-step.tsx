"use client"

import { useState } from "react"
import { Plus, Trash2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { ProposalData } from "../proposal-drawer"

interface PricingStepProps {
  data: ProposalData
  onUpdate: (updates: Partial<ProposalData>) => void
}

interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

const paymentScheduleTemplates = [
  {
    name: "50/50 Split",
    schedule: [
      { name: "Deposit", percentage: 50 },
      { name: "Completion", percentage: 50 },
    ],
  },
  {
    name: "30/40/30",
    schedule: [
      { name: "Deposit", percentage: 30 },
      { name: "Midpoint", percentage: 40 },
      { name: "Completion", percentage: 30 },
    ],
  },
  {
    name: "25/25/25/25",
    schedule: [
      { name: "Deposit", percentage: 25 },
      { name: "Phase 1", percentage: 25 },
      { name: "Phase 2", percentage: 25 },
      { name: "Completion", percentage: 25 },
    ],
  },
]

export function PricingStep({ data, onUpdate }: PricingStepProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>(
    data.lineItems || [{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }],
  )
  const [taxRate, setTaxRate] = useState(20) // Default UK VAT
  const [paymentSchedule, setPaymentSchedule] = useState("50/50 Split")
  const [isGenerating, setIsGenerating] = useState(false)

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    }
    const updatedItems = [...lineItems, newItem]
    setLineItems(updatedItems)
    updatePricing(updatedItems)
  }

  const removeLineItem = (id: string) => {
    const updatedItems = lineItems.filter((item) => item.id !== id)
    setLineItems(updatedItems)
    updatePricing(updatedItems)
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    const updatedItems = lineItems.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === "quantity" || field === "rate") {
          updated.amount = updated.quantity * updated.rate
        }
        return updated
      }
      return item
    })
    setLineItems(updatedItems)
    updatePricing(updatedItems)
  }

  const updatePricing = (items: LineItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    const tax = subtotal * (taxRate / 100)
    const total = subtotal + tax

    onUpdate({
      lineItems: items,
      subtotal,
      tax,
      total,
    })
  }

  const handleAIPricing = async () => {
    setIsGenerating(true)
    // Simulate AI pricing suggestions
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const aiSuggestions: LineItem[] = [
      {
        id: "1",
        description: "Design Development & Concept Creation",
        quantity: 1,
        rate: 15000,
        amount: 15000,
      },
      {
        id: "2",
        description: "Space Planning & Technical Drawings",
        quantity: 1,
        rate: 8000,
        amount: 8000,
      },
      {
        id: "3",
        description: "Material Selection & Specification",
        quantity: 1,
        rate: 5000,
        amount: 5000,
      },
      {
        id: "4",
        description: "3D Visualization & Renderings",
        quantity: 3,
        rate: 1500,
        amount: 4500,
      },
      {
        id: "5",
        description: "Project Management & Coordination",
        quantity: 1,
        rate: 7500,
        amount: 7500,
      },
    ]

    setLineItems(aiSuggestions)
    updatePricing(aiSuggestions)
    setIsGenerating(false)
  }

  const subtotal = data.subtotal || 0
  const tax = data.tax || 0
  const total = data.total || 0
  const currencySymbol = data.currency === "USD" ? "$" : data.currency === "EUR" ? "€" : "£"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-greige-50 rounded-lg border border-borderSoft">
        <div className="w-10 h-10 bg-clay-100 rounded-lg flex items-center justify-center">
          <span className="text-clay-600 font-semibold">£</span>
        </div>
        <div>
          <h3 className="font-semibold text-ink">Pricing & Payment</h3>
          <p className="text-sm text-ink-muted">Add line items and configure payment terms</p>
        </div>
      </div>

      {/* AI Pricing Helper */}
      <Card className="border-amber-100 bg-[#FFFDF5]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-ink">AI Pricing Assistant</h4>
              <p className="text-sm text-ink-muted">Generate pricing suggestions based on project scope</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAIPricing}
              disabled={!data.scope || isGenerating}
              className="gap-2 bg-black border-black text-white hover:bg-black/90"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              {isGenerating ? "Generating..." : "Suggest Pricing"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-ink">
            Line Items <span className="text-red-500">*</span>
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={addLineItem}
            className="gap-2 bg-white border-borderSoft hover:bg-greige-50"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>

        <Card className="border-borderSoft">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-greige-50 border-b border-borderSoft">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ink-muted" style={{ width: "40%" }}>
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ink-muted" style={{ width: "15%" }}>
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ink-muted" style={{ width: "20%" }}>
                      Rate
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-ink-muted" style={{ width: "20%" }}>
                      Amount
                    </th>
                    <th
                      className="px-4 py-3 text-center text-sm font-medium text-ink-muted"
                      style={{ width: "5%" }}
                    ></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderSoft">
                  {lineItems.map((item, index) => (
                    <tr key={item.id} className="bg-white">
                      <td className="px-4 py-3">
                        <Textarea
                          placeholder="Description of work or deliverable..."
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                          rows={2}
                          className="resize-none border-0 p-0 focus-visible:ring-0 bg-transparent"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, "quantity", Number.parseFloat(e.target.value) || 0)}
                          className="border-0 p-0 focus-visible:ring-0 bg-transparent text-center"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="text-ink-muted mr-1">{currencySymbol}</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => updateLineItem(item.id, "rate", Number.parseFloat(e.target.value) || 0)}
                            className="border-0 p-0 focus-visible:ring-0 bg-transparent"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium tabular-nums text-ink">
                          {currencySymbol}
                          {item.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {lineItems.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(item.id)}
                            className="h-8 w-8 p-0 text-ink-muted hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Totals */}
      <Card className="border-borderSoft">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-muted">Subtotal</span>
              <span className="font-medium tabular-nums text-ink">
                {currencySymbol}
                {subtotal.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-muted">Tax</span>
                <Select
                  value={taxRate.toString()}
                  onValueChange={(value) => {
                    const rate = Number.parseInt(value)
                    setTaxRate(rate)
                    updatePricing(lineItems)
                  }}
                >
                  <SelectTrigger className="w-20 h-6 text-xs bg-white border-borderSoft">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="font-medium tabular-nums text-ink">
                {currencySymbol}
                {tax.toLocaleString()}
              </span>
            </div>

            <Separator className="bg-borderSoft" />

            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink">Total</span>
              <span className="font-bold text-lg tabular-nums text-ink">
                {currencySymbol}
                {total.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-ink">Payment Schedule</Label>

        <div className="grid grid-cols-3 gap-4">
          {paymentScheduleTemplates.map((template) => (
            <button
              key={template.name}
              onClick={() => setPaymentSchedule(template.name)}
              className={`p-4 text-left rounded-lg border transition-colors ${
                paymentSchedule === template.name
                  ? "border-clay-600 bg-clay-50"
                  : "border-borderSoft hover:border-clay-300 hover:bg-greige-50"
              }`}
            >
              <div className="font-medium text-ink mb-2">{template.name}</div>
              <div className="space-y-1">
                {template.schedule.map((phase, index) => (
                  <div key={index} className="flex justify-between text-sm text-ink-muted">
                    <span>{phase.name}</span>
                    <span>{phase.percentage}%</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
