"use client"

import { ChevronLeft, Calculator, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { ProposalData } from "./proposal-drawer"

interface ProposalSummaryProps {
  data: ProposalData
  onToggle: () => void
}

export function ProposalSummary({ data, onToggle }: ProposalSummaryProps) {
  const currencySymbol = data.currency === "USD" ? "$" : data.currency === "EUR" ? "€" : "£"
  const subtotal = data.subtotal || 0
  const tax = data.tax || 0
  const total = data.total || 0

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Summary</h3>
        <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0">
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Client Info */}
        {data.client && (
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-900">Client</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="text-sm font-medium text-gray-900">{data.client}</div>
              {data.contact && <div className="text-sm text-gray-600">{data.contact}</div>}
              {data.branding && (
                <Badge variant="secondary" className="text-xs">
                  {data.branding}
                </Badge>
              )}
            </CardContent>
          </Card>
        )}

        {/* Project Details */}
        {data.title && (
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Project
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="text-sm font-medium text-gray-900">{data.title}</div>
              {data.validUntil && (
                <div className="text-xs text-gray-600">
                  Valid until {new Date(data.validUntil).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pricing Summary */}
        {(subtotal > 0 || data.lineItems?.length) && (
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {data.lineItems?.map((item, index) => (
                <div key={item.id} className="text-xs space-y-1">
                  <div className="font-medium text-gray-900 line-clamp-2">
                    {item.description || `Item ${index + 1}`}
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>
                      {item.quantity} × {currencySymbol}
                      {item.rate.toLocaleString()}
                    </span>
                    <span className="font-medium">
                      {currencySymbol}
                      {item.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              {subtotal > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="tabular-nums">
                        {currencySymbol}
                        {subtotal.toLocaleString()}
                      </span>
                    </div>
                    {tax > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Tax</span>
                        <span className="tabular-nums">
                          {currencySymbol}
                          {tax.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-gray-900">
                      <span>Total</span>
                      <span className="tabular-nums">
                        {currencySymbol}
                        {total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-900">Progress</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Client & Branding</span>
                <div
                  className={`w-2 h-2 rounded-full ${data.client && data.contact ? "bg-green-500" : "bg-gray-300"}`}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Details</span>
                <div
                  className={`w-2 h-2 rounded-full ${data.title && data.currency && data.validUntil ? "bg-green-500" : "bg-gray-300"}`}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Scope</span>
                <div className={`w-2 h-2 rounded-full ${data.scope ? "bg-green-500" : "bg-gray-300"}`} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pricing</span>
                <div
                  className={`w-2 h-2 rounded-full ${data.lineItems?.length && data.total ? "bg-green-500" : "bg-gray-300"}`}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Terms</span>
                <div className={`w-2 h-2 rounded-full ${data.terms ? "bg-green-500" : "bg-gray-300"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
