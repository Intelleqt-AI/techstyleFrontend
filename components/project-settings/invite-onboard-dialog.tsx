"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Users, Send, Rocket } from "lucide-react"

type Props = {
  projectId: string
  defaultRecipients?: string[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onStartWizard?: () => void
}

export function InviteOnboardDialog({ projectId, defaultRecipients = [], open, onOpenChange, onStartWizard }: Props) {
  const [recipients, setRecipients] = useState<string[]>(defaultRecipients)
  const [newEmail, setNewEmail] = useState("")

  function addRecipient() {
    if (!newEmail.trim()) return
    setRecipients((r) => Array.from(new Set([...r, newEmail.trim()])))
    setNewEmail("")
  }
  function removeRecipient(email: string) {
    setRecipients((r) => r.filter((e) => e !== email))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-clay-500 hover:bg-clay-600 text-white">
          <Rocket className="w-4 h-4 mr-2" />
          Invite Client to Onboard
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite client to start onboarding</DialogTitle>
          <DialogDescription>Choose recipients and preview the 5‑step client‑portal wizard.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Add recipient</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="email"
                placeholder="client@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={addRecipient}>
                Add
              </Button>
            </div>
          </div>

          <div>
            <Label>Recipients</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {recipients.length === 0 && <span className="text-sm text-muted-foreground">No recipients yet.</span>}
              {recipients.map((email) => (
                <Badge key={email} variant="secondary" className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  {email}
                  <button
                    type="button"
                    className="ml-1 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => removeRecipient(email)}
                    aria-label={`Remove ${email}`}
                  >
                    {"×"}
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <Label>Wizard preview</Label>
            <ol className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <li>{"1) Contacts & Access"}</li>
              <li>{"2) Property Details"}</li>
              <li>{"3) Rooms & Areas"}</li>
              <li>{"4) Delivery & Billing"}</li>
              <li>{"5) Preferences & Consent"}</li>
            </ol>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          <Button
            className="bg-clay-500 hover:bg-clay-600 text-white"
            onClick={() => {
              // In a real system, send invitations here.
              onOpenChange?.(false)
              onStartWizard?.()
            }}
          >
            <Send className="w-4 h-4 mr-2" />
            Start wizard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
