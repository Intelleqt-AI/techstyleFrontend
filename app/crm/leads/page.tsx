"use client"

import { useState } from "react"
import { Search, Filter, Plus, Mail, Phone, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CrmNav } from "@/components/crm-nav"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/chip"

const leads = [
  {
    id: 1,
    name: "Alex Thompson",
    company: "Thompson Design Co",
    email: "alex@thompsondesign.com",
    phone: "+1 (555) 987-6543",
    source: "Website",
    status: "New",
    score: 85,
    avatar: "AT",
  },
  {
    id: 2,
    name: "Maria Garcia",
    company: "Garcia Enterprises",
    email: "maria@garciaent.com",
    phone: "+1 (555) 876-5432",
    source: "Referral",
    status: "Qualified",
    score: 92,
    avatar: "MG",
  },
  {
    id: 3,
    name: "James Wilson",
    company: "Wilson Holdings",
    email: "james@wilsonholdings.com",
    phone: "+1 (555) 765-4321",
    source: "LinkedIn",
    status: "Contacted",
    score: 78,
    avatar: "JW",
  },
  {
    id: 4,
    name: "Lisa Chen",
    company: "Chen Consulting",
    email: "lisa@chenconsulting.com",
    phone: "+1 (555) 654-3210",
    source: "Trade Show",
    status: "New",
    score: 88,
    avatar: "LC",
  },
]

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-olive-700"
  if (score >= 70) return "text-clay-600"
  return "text-terracotta-600"
}

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex-1 bg-neutral-50 p-6">
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
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:opacity-90">
              <Plus className="w-4 h-4" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 48 }}>
                    <input type="checkbox" className="rounded border-gray-300" aria-label="Select all leads" />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 320 }}>
                    Lead
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 360 }}>
                    Contact Info
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 160 }}>
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 160 }}>
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600" style={{ width: 120 }}>
                    Score
                  </th>
                  <th className="pl-4 pr-6 py-3 text-right text-sm font-medium text-gray-600" style={{ width: 96 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-gray-300" aria-label={`Select ${lead.name}`} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarImage src={"/placeholder.svg?height=32&width=32&query=avatar"} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                            {lead.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate" title={lead.name}>
                            {lead.name}
                          </div>
                          <div className="text-xs text-gray-600 truncate" title={lead.company}>
                            {lead.company}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div
                          className="flex items-center gap-2 text-gray-600 whitespace-nowrap truncate"
                          title={lead.email}
                        >
                          <Mail className="w-4 h-4 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        <div
                          className="flex items-center gap-2 text-gray-600 whitespace-nowrap truncate"
                          title={lead.phone}
                        >
                          <Phone className="w-4 h-4 shrink-0" />
                          <span className="truncate">{lead.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap truncate" title={lead.source}>
                      {lead.source}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${getScoreColor(lead.score)} tabular-nums`}>{lead.score}</span>
                    </td>
                    <td className="pl-4 pr-6 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                            aria-label={`Open actions for ${lead.name}`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Send Email</DropdownMenuItem>
                          <DropdownMenuItem>Schedule Call</DropdownMenuItem>
                          <DropdownMenuItem>Convert to Contact</DropdownMenuItem>
                          <DropdownMenuItem>Mark as Lost</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
