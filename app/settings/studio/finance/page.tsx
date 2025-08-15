"use client"

import { useActionState } from "react"
import { saveSettings } from "@/app/settings/actions"
import { Section } from "@/components/settings/section"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const currencies = [
  { code: "USD", label: "US Dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "CAD", label: "Canadian Dollar (CAD)" },
  { code: "AUD", label: "Australian Dollar (AUD)" },
]

export default function StudioFinancePage() {
  const { toast } = useToast()
  const [state, formAction, pending] = useActionState(saveSettings as any, null)

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Finance</h1>
        <p className="text-sm text-gray-600">Currency, tax, invoice numbering, and payment terms.</p>
      </div>

      <Section title="Defaults" description="Set your studio-wide financial defaults.">
        <form
          action={async (fd) => {
            fd.set("section", "Finance")
            const res = await (formAction as any)(fd)
            if (res?.success) toast({ title: "Saved", description: "Finance settings updated." })
          }}
          className="grid gap-6 sm:grid-cols-2"
        >
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select defaultValue="USD" name="currency">
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxRate">Default tax rate (%)</Label>
            <Input id="taxRate" name="taxRate" type="number" step="0.01" defaultValue={8.875} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">Invoice prefix</Label>
            <Input id="invoicePrefix" name="invoicePrefix" placeholder="TS-" defaultValue="TS-" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextInvoice">Next invoice number</Label>
            <Input id="nextInvoice" name="nextInvoice" type="number" defaultValue={1024} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Payment terms (days)</Label>
            <Input id="paymentTerms" name="paymentTerms" type="number" defaultValue={30} />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <Button disabled={pending}>{pending ? "Saving..." : "Save finance settings"}</Button>
          </div>
        </form>
      </Section>
    </div>
  )
}
