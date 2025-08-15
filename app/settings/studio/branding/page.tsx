"use client"

import { Section } from "@/components/settings/section"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useActionState } from "react"
import { saveSettings } from "@/app/settings/actions"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function StudioBrandingPage() {
  const { toast } = useToast()
  const [state, formAction, pending] = useActionState(saveSettings as any, null)

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Branding</h1>
        <p className="text-sm text-gray-600">Logos and brand colors used across proposals and documents.</p>
      </div>

      <Section title="Logos" description="Upload your primary and monochrome logos.">
        <form
          action={async (fd) => {
            fd.set("section", "Branding")
            const res = await (formAction as any)(fd)
            if (res?.success) toast({ title: "Saved", description: "Branding updated." })
          }}
          className="grid gap-6 sm:grid-cols-2"
        >
          <div className="space-y-3">
            <Label>Primary logo</Label>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-md border border-gray-200 bg-white">
                <Image
                  src="/placeholder.svg?height=64&width=64"
                  alt="Primary logo"
                  fill
                  className="object-contain p-2"
                />
              </div>
              <Input type="file" accept="image/*" />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Monochrome logo</Label>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-md border border-gray-200 bg-white">
                <Image
                  src="/placeholder.svg?height=64&width=64"
                  alt="Monochrome logo"
                  fill
                  className="object-contain p-2"
                />
              </div>
              <Input type="file" accept="image/*" />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="primaryColor">Primary color</Label>
            <Input id="primaryColor" name="primaryColor" type="color" defaultValue="#111827" />
          </div>
          <div className="space-y-3">
            <Label htmlFor="secondaryColor">Secondary color</Label>
            <Input id="secondaryColor" name="secondaryColor" type="color" defaultValue="#4B5563" />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <Button disabled={pending}>{pending ? "Saving..." : "Save branding"}</Button>
          </div>
        </form>
      </Section>
    </div>
  )
}
