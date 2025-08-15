"use client"

import { useActionState } from "react"
import { saveSettings } from "@/app/settings/actions"
import { Section } from "@/components/settings/section"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function UserAppearancePage() {
  const { toast } = useToast()
  const [state, formAction, pending] = useActionState(saveSettings as any, null)

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Appearance</h1>
        <p className="text-sm text-gray-600">Theme, density, and accent color.</p>
      </div>

      <Section title="Interface" description="Personalize how the app looks for you.">
        <form
          action={async (fd) => {
            fd.set("section", "Appearance")
            const res = await (formAction as any)(fd)
            if (res?.success) toast({ title: "Saved", description: "Appearance updated." })
          }}
          className="grid gap-6 sm:grid-cols-2"
        >
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select defaultValue="system" name="theme">
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Density</Label>
            <Select defaultValue="comfortable" name="density">
              <SelectTrigger>
                <SelectValue placeholder="Select density" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accent">Accent color</Label>
            <Input id="accent" name="accent" type="color" defaultValue="#111827" />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <Button disabled={pending}>{pending ? "Saving..." : "Save appearance"}</Button>
          </div>
        </form>
      </Section>
    </div>
  )
}
