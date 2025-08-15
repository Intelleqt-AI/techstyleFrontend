"use client"

import { useActionState } from "react"
import { saveSettings } from "@/app/settings/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Section } from "@/components/settings/section"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

export default function UserSecurityPage() {
  const { toast } = useToast()
  const [state, formAction, pending] = useActionState(saveSettings as any, null)

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Security</h1>
        <p className="text-sm text-gray-600">Protect your account by updating your password and enabling 2FA.</p>
      </div>

      <Section title="Password" description="Use a strong password you don’t reuse elsewhere.">
        <form
          action={async (fd) => {
            fd.set("section", "Password")
            const res = await (formAction as any)(fd)
            if (res?.success) toast({ title: "Saved", description: "Password updated." })
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <Label htmlFor="current">Current password</Label>
            <Input id="current" name="current" type="password" />
          </div>
          <div>
            <Label htmlFor="new">New password</Label>
            <Input id="new" name="new" type="password" />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input id="confirm" name="confirm" type="password" />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button disabled={pending}>{pending ? "Saving..." : "Update password"}</Button>
          </div>
        </form>
      </Section>

      <Section title="Two-factor authentication" description="Add an extra layer of security to your account.">
        <form
          action={async (fd) => {
            fd.set("section", "Two-factor authentication")
            const res = await (formAction as any)(fd)
            if (res?.success) toast({ title: "Saved", description: "2FA preference updated." })
          }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <div className="font-medium text-gray-900">Authenticator app</div>
              <div className="text-sm text-gray-600">Use an app to generate verification codes.</div>
            </div>
            <Switch name="auth_app" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <div className="font-medium text-gray-900">SMS backup codes</div>
              <div className="text-sm text-gray-600">Send codes to your phone if you lose access.</div>
            </div>
            <Switch name="sms_backup" />
          </div>
          <div className="flex justify-end">
            <Button disabled={pending}>{pending ? "Saving..." : "Save 2FA settings"}</Button>
          </div>
        </form>
      </Section>

      <Section title="Active sessions" description="Sign out devices you don’t recognize.">
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last active</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { device: "MacBook Pro • Safari", loc: "New York, US", last: "2 mins ago" },
                { device: "iPhone 15 • Mobile Safari", loc: "New York, US", last: "Yesterday" },
              ].map((s) => (
                <TableRow key={s.device}>
                  <TableCell className="font-medium">{s.device}</TableCell>
                  <TableCell>{s.loc}</TableCell>
                  <TableCell>{s.last}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Sign out
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>
    </div>
  )
}
