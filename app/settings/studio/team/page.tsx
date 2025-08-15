"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsPageHeader } from "@/components/settings/page-header"
import { SettingsSection } from "@/components/settings/section"
import { StatusBadge } from "@/components/chip" // use global status chip styles

type Member = {
  id: string
  name: string
  email: string
  role: "Admin" | "Manager" | "Member"
  status: "active" | "invited" | "suspended"
}

const members: Member[] = [
  { id: "1", name: "Jane Designer", email: "jane@techstyles.com", role: "Admin", status: "active" },
  { id: "2", name: "Sam Projector", email: "sam@techstyles.com", role: "Manager", status: "active" },
  { id: "3", name: "Chris Maker", email: "chris@techstyles.com", role: "Member", status: "invited" },
]

export default function TeamPage() {
  return (
    <>
      <SettingsPageHeader title="Team" description="Manage members, invites, and statuses." />

      <SettingsSection
        title="Members"
        description="Add, remove, and manage studio members."
        action={
          <Button size="sm" className="bg-clay-600 text-white hover:bg-clay-700">
            Invite member
          </Button>
        }
      >
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div className="grid grid-cols-[1fr,160px,120px,220px] items-center px-4 py-2 text-xs text-muted-foreground bg-neutral-50">
            <div>Member</div>
            <div>Role</div>
            <div>Status</div>
            <div className="text-right pr-2">Actions</div>
          </div>
          <ul className="divide-y">
            {members.map((m) => (
              <li key={m.id} className="grid grid-cols-[1fr,160px,120px,220px] items-center px-4 py-3 bg-white">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {m.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{m.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{m.email}</div>
                  </div>
                </div>

                <div>
                  <Select defaultValue={m.role}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  {/* Use global StatusBadge to ensure consistent pill shape and earthy palette */}
                  <StatusBadge status={m.status} />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm">
                    Resend invite
                  </Button>
                  <Button variant="outline" size="sm">
                    Suspend
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </SettingsSection>
    </>
  )
}
