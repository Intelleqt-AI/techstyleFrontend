"use client"

import { useActionState } from "react"
import { saveSettings } from "@/app/settings/actions"
import { Section } from "@/components/settings/section"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function UserNotificationsPage() {
  const { toast } = useToast()
  const [state, formAction, pending] = useActionState(saveSettings as any, null)

  const items = [
    { name: "Project updates", key: "project_updates", desc: "Mentions, status changes, and assignments." },
    { name: "Comments", key: "comments", desc: "Replies to threads you're in." },
    { name: "Reminders", key: "reminders", desc: "Deadlines and overdue tasks." },
    { name: "Marketing emails", key: "marketing", desc: "Product news and tips." },
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-600">Choose what you want to be notified about.</p>
      </div>

      <Section title="Preferences" description="Control email and push notifications.">
        <form
          action={async (fd) => {
            fd.set("section", "Notifications")
            const res = await (formAction as any)(fd)
            if (res?.success) toast({ title: "Saved", description: "Notification preferences updated." })
          }}
          className="space-y-4"
        >
          {items.map((i) => (
            <div key={i.key} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div>
                <div className="font-medium text-gray-900">{i.name}</div>
                <div className="text-sm text-gray-600">{i.desc}</div>
              </div>
              <Switch name={i.key} defaultChecked />
            </div>
          ))}
          <div className="flex justify-end">
            <Button disabled={pending}>{pending ? "Saving..." : "Save preferences"}</Button>
          </div>
        </form>
      </Section>
    </div>
  )
}
