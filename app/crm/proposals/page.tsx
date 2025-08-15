"use client"

import { useState } from "react"
import { Search, Filter, Plus, FileText, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CrmNav } from "@/components/crm-nav"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/chip"
import { ProposalDrawer } from "@/components/crm/proposal-drawer"

type Proposal = {
  id: number
  title: string
  client: string
  value: string
  status: "Draft" | "Sent" | "Under Review" | "Accepted" | "Rejected"
  sentDate: string | null
  expiryDate: string | null
  contact: string
  avatar: string
}

const proposals: Proposal[] = [
  {
    id: 1,
    title: "Modern Office Redesign Proposal",
    client: "Tech Innovations Inc",
    value: "£125,000",
    status: "Sent",
    sentDate: "2024-01-15",
    expiryDate: "2024-02-15",
    contact: "Sarah Johnson",
    avatar: "SJ",
  },
  {
    id: 2,
    title: "Luxury Residential Interior",
    client: "Johnson Family Trust",
    value: "£85,000",
    status: "Draft",
    sentDate: null,
    expiryDate: "2024-02-20",
    contact: "Michael Johnson",
    avatar: "MJ",
  },
  {
    id: 3,
    title: "Restaurant Renovation Package",
    client: "Bistro 21",
    value: "£95,000",
    status: "Accepted",
    sentDate: "2024-01-10",
    expiryDate: "2024-02-10",
    contact: "Chef Marco",
    avatar: "CM",
  },
  {
    id: 4,
    title: "Corporate Headquarters Design",
    client: "Innovation Corp",
    value: "£200,000",
    status: "Under Review",
    sentDate: "2024-01-20",
    expiryDate: "2024-02-25",
    contact: "David Wilson",
    avatar: "DW",
  },
  {
    id: 5,
    title: "Retail Concept Refresh",
    client: "Style Hub",
    value: "£60,000",
    status: "Rejected",
    sentDate: "2024-01-08",
    expiryDate: "2024-02-12",
    contact: "Ava Stone",
    avatar: "AS",
  },
]

export default function ProposalsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewProposal, setShowNewProposal] = useState(false)

  const filtered = proposals.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contact.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <CrmNav />

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="outline" size="sm" className="gap-2 h-9 bg-transparent">
              <Filter className="w-4 h-4" />
              Filter
            </Button>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-2 bg-gray-900 hover:bg-gray-800" onClick={() => setShowNewProposal(true)}>
              <Plus className="w-4 h-4" />
              New Proposal
            </Button>
          </div>
        </div>

        {/* Proposals Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 48 }}>
                    <input type="checkbox" className="rounded border-gray-300" aria-label="Select all proposals" />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 360 }}>
                    Proposal
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 240 }}>
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 140 }}>
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 160 }}>
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 160 }}>
                    Sent Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 160 }}>
                    Expires
                  </th>
                  <th className="pl-4 pr-6 py-3 text-right text-sm font-medium text-gray-600" style={{ width: 96 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filtered.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        aria-label={`Select ${proposal.title}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1 min-w-0">
                        <div
                          className="font-medium text-gray-900 flex items-center gap-2 whitespace-nowrap truncate"
                          title={proposal.title}
                        >
                          <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate">{proposal.title}</span>
                        </div>
                        <div className="text-xs text-gray-600 whitespace-nowrap truncate" title={proposal.contact}>
                          {proposal.contact}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap truncate" title={proposal.client}>
                      {proposal.client}
                    </td>
                    <td
                      className="px-4 py-3 font-medium text-gray-900 tabular-nums whitespace-nowrap truncate"
                      title={proposal.value}
                    >
                      {proposal.value}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={proposal.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap truncate" title={proposal.sentDate || "-"}>
                      {proposal.sentDate ? new Date(proposal.sentDate).toLocaleDateString() : "-"}
                    </td>
                    <td
                      className="px-4 py-3 text-gray-600 whitespace-nowrap truncate"
                      title={proposal.expiryDate || "-"}
                    >
                      {proposal.expiryDate ? new Date(proposal.expiryDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="pl-4 pr-6 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                            aria-label={`Open actions for ${proposal.title}`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Proposal</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          <DropdownMenuItem>Download PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <ProposalDrawer open={showNewProposal} onClose={() => setShowNewProposal(false)} />
      </div>
    </div>
  )
}
