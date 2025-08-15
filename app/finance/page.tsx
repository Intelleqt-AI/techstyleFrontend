"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/chip"
import { Plus, RefreshCw, Search, Filter, MoreHorizontal, FileText, ShoppingCart } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const financeStats = [
  {
    title: "Total Invoices",
    value: "£425,000",
    subtitle: "24 Invoices",
    icon: FileText,
  },
  {
    title: "Total Purchase Orders",
    value: "£128,500",
    subtitle: "18 Purchase Orders",
    icon: ShoppingCart,
  },
]

const studioFinanceData = [
  {
    id: 1,
    number: "INV-001",
    supplier: "Smith Family",
    type: "Invoice",
    project: "Luxury Penthouse",
    dateIssued: "2024-11-01",
    dueDate: "2024-12-01",
    amount: "£25,000.00",
    status: "paid",
  },
  {
    id: 2,
    number: "PO-002",
    supplier: "West Elm",
    type: "Purchase Order",
    project: "Modern Office",
    dateIssued: "2024-11-03",
    dueDate: "2024-11-17",
    amount: "£2,450.00",
    status: "approved",
  },
  {
    id: 3,
    number: "INV-003",
    supplier: "TechCorp Inc.",
    type: "Invoice",
    project: "Modern Office",
    dateIssued: "2024-11-03",
    dueDate: "2024-12-03",
    amount: "£15,000.00",
    status: "pending",
  },
  {
    id: 4,
    number: "PO-004",
    supplier: "John Lewis",
    type: "Purchase Order",
    project: "Boutique Hotel",
    dateIssued: "2024-10-28",
    dueDate: "2024-11-11",
    amount: "£1,890.00",
    status: "approved",
  },
  {
    id: 5,
    number: "INV-005",
    supplier: "Grandeur Hotels",
    type: "Invoice",
    project: "Boutique Hotel",
    dateIssued: "2024-10-25",
    dueDate: "2024-11-25",
    amount: "£8,500.00",
    status: "overdue",
  },
  {
    id: 6,
    number: "INV-006",
    supplier: "Johnson Family",
    type: "Invoice",
    project: "Kitchen Remodel",
    dateIssued: "2024-11-05",
    dueDate: "2024-12-05",
    amount: "£12,000.00",
    status: "draft",
  },
  {
    id: 7,
    number: "PO-007",
    supplier: "Habitat",
    type: "Purchase Order",
    project: "Luxury Penthouse",
    dateIssued: "2024-11-02",
    dueDate: "2024-11-16",
    amount: "£3,200.00",
    status: "pending",
  },
  {
    id: 8,
    number: "INV-008",
    supplier: "Design Studio Ltd",
    type: "Invoice",
    project: "Corporate Headquarters",
    dateIssued: "2024-11-04",
    dueDate: "2024-12-04",
    amount: "£18,750.00",
    status: "paid",
  },
]

export default function FinancePage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = studioFinanceData.filter(
    (item) =>
      item.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.project.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Finance Stats (restored inline cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {financeStats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.title} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gray-500" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-lg font-semibold text-gray-900 tabular-nums leading-tight">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search invoices and POs..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search invoices and purchase orders"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button className="bg-gray-900 text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync with Xero
            </Button>
          </div>
        </div>

        {/* Finance Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              {/* Sticky header, Title Case, no ALL CAPS */}
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <span className="sr-only">{"Select row"}</span>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">
                    Number
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-52">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-40">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-56">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">
                    Date Issued
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-28">
                    Status
                  </th>
                  <th className="pl-4 pr-6 py-3 text-right text-sm font-medium text-gray-600 whitespace-nowrap w-24">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 align-middle">
                      <input aria-label={`Select ${item.number}`} type="checkbox" className="rounded border-gray-300" />
                    </td>

                    <td className="px-4 py-3 align-middle whitespace-nowrap">
                      <div className="truncate" title={item.number}>
                        {item.number}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle whitespace-nowrap text-gray-700">
                      <div className="truncate" title={item.supplier}>
                        {item.supplier}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle whitespace-nowrap text-gray-700">
                      <div className="truncate" title={item.type}>
                        {item.type}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle whitespace-nowrap text-gray-700">
                      <div className="truncate" title={item.project}>
                        {item.project}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle whitespace-nowrap text-gray-700">
                      <div className="truncate" title={item.dateIssued}>
                        {item.dateIssued}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle whitespace-nowrap text-gray-700">
                      <div className="truncate" title={item.dueDate}>
                        {item.dueDate}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle whitespace-nowrap font-medium text-gray-900 tabular-nums">
                      <div className="truncate" title={item.amount}>
                        {item.amount}
                      </div>
                    </td>

                    <td className="px-4 py-3 align-middle whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="pl-4 pr-6 py-3 align-middle text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                            aria-label={`Row actions for ${item.number}`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Download PDF</DropdownMenuItem>
                          <DropdownMenuItem>Send Email</DropdownMenuItem>
                          <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices or purchase orders found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or create your first invoice</p>
              <Button className="bg-gray-900 text-white hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
