"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

type Role = "Admin" | "Manager" | "Member"
type Perm =
  | "projects.view"
  | "projects.edit"
  | "tasks.view"
  | "tasks.edit"
  | "finance.view"
  | "finance.edit"
  | "clients.view"
  | "clients.edit"

const roles: Role[] = ["Admin", "Manager", "Member"]
const perms: { key: Perm; label: string }[] = [
  { key: "projects.view", label: "Projects • view" },
  { key: "projects.edit", label: "Projects • edit" },
  { key: "tasks.view", label: "Tasks • view" },
  { key: "tasks.edit", label: "Tasks • edit" },
  { key: "finance.view", label: "Finance • view" },
  { key: "finance.edit", label: "Finance • edit" },
  { key: "clients.view", label: "Clients • view" },
  { key: "clients.edit", label: "Clients • edit" },
]

const defaults: Record<Role, Record<Perm, boolean>> = {
  Admin: Object.fromEntries(perms.map((p) => [p.key, true])) as Record<Perm, boolean>,
  Manager: {
    "projects.view": true,
    "projects.edit": true,
    "tasks.view": true,
    "tasks.edit": true,
    "finance.view": true,
    "finance.edit": false,
    "clients.view": true,
    "clients.edit": true,
  },
  Member: {
    "projects.view": true,
    "projects.edit": false,
    "tasks.view": true,
    "tasks.edit": true,
    "finance.view": false,
    "finance.edit": false,
    "clients.view": true,
    "clients.edit": false,
  },
}

export function PermissionsMatrix() {
  const [matrix, setMatrix] = useState(defaults)

  function toggle(role: Role, perm: Perm) {
    setMatrix((prev) => ({
      ...prev,
      [role]: { ...prev[role], [perm]: !prev[role][perm] },
    }))
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">Permission</TableHead>
            {roles.map((r) => (
              <TableHead key={r} className="text-center">
                <span className="inline-flex items-center gap-2 font-medium">
                  {r}
                  {r === "Admin" ? <Badge className="bg-gray-100 text-gray-900">All</Badge> : null}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {perms.map((p) => (
            <TableRow key={p.key}>
              <TableCell className="text-sm text-gray-700">{p.label}</TableCell>
              {roles.map((r) => (
                <TableCell key={r} className="text-center">
                  <Checkbox
                    checked={!!matrix[r][p.key]}
                    onCheckedChange={() => toggle(r, p.key)}
                    aria-label={`${r} can ${p.label}`}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
