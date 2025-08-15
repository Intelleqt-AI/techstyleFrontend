"use client"

import { useMemo, useState } from "react"
import { Section } from "@/components/settings/section"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/chip"

type Severity = "low" | "medium" | "high"

type Log = {
  id: string
  actor: string
  action: string
  target: string
  severity: Severity
  date: string
}

const seeded: Log[] = [
  {
    id: "l1",
    actor: "Jane",
    action: "updated finance settings",
    target: "Finance",
    severity: "medium",
    date: "2025-08-07 14:22",
  },
  {
    id: "l2",
    actor: "Sam",
    action: "invited member",
    target: "Team",
    severity: "low",
    date: "2025-08-07 09:11",
  },
  {
    id: "l3",
    actor: "Jane",
    action: "connected integration",
    target: "Slack",
    severity: "low",
    date: "2025-08-06 18:03",
  },
  {
    id: "l4",
    actor: "Chris",
    action: "changed role permissions",
    target: "Roles",
    severity: "high",
    date: "2025-08-05 16:45",
  },
]

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function AuditLogsPage() {
  const [query, setQuery] = useState("")
  const [severity, setSeverity] = useState<"all" | Severity>("all")

  const filtered = useMemo(() => {
    return seeded.filter(
      (l) =>
        (severity === "all" || l.severity === severity) &&
        [l.actor, l.action, l.target].join(" ").toLowerCase().includes(query.toLowerCase()),
    )
  }, [query, severity])

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Audit logs</h1>
        <p className="text-sm text-gray-600">Track important changes across your studio.</p>
      </div>

      <Section title="Activity" description="Search and filter by severity.">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Search by actor, action, or target..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:w-[320px]"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Severity</span>
            <Select defaultValue="all" onValueChange={(v: "all" | Severity) => setSeverity(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.actor}</TableCell>
                  <TableCell>{l.action}</TableCell>
                  <TableCell>{l.target}</TableCell>
                  <TableCell>
                    {/* Use global StatusBadge for consistent pill shape/colors */}
                    <StatusBadge status={l.severity} label={titleCase(l.severity)} />
                  </TableCell>
                  <TableCell>{l.date}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-500">
                    No results.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </Section>
    </div>
  )
}
