"use client"

import { ProjectNav } from "@/components/project-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/chip"
import { FileText, ShoppingCart, Plus, RefreshCw, Search, Filter, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" })

function parseGBP(amount: string): number {
  // Removes currency symbol and thousands separators, keeps decimals
  return Number(amount.replace(/[^0-9.]/g, ""))
}

const sampleData = [
  {
    id: 1,
    number: "INV-001",
    supplier: "West Elm",
    type: "Invoice",
    dateIssued: "2024-02-05",
    dueDate: "2024-03-05",
    amount: "£2,450.00",
    status: "pending",
  },
  {
    id: 2,
    number: "PO-002",
    supplier: "John Lewis",
    type: "Purchase Order",
    dateIssued: "2024-02-03",
    dueDate: "2024-02-17",
    amount: "£1,890.00",
    status: "approved",
  },
  {
    id: 3,
    number: "INV-003",
    supplier: "Habitat",
    type: "Invoice",
    dateIssued: "2024-02-01",
    dueDate: "2024-03-01",
    amount: "£3,200.00",
    status: "paid",
  },
]

export default function ProjectFinancePage({ params }: { params: { id: string } }) {
  const invoiceItems = sampleData.filter((i) => i.type === "Invoice")
  const poItems = sampleData.filter((i) => i.type === "Purchase Order")

  const invoiceTotal = invoiceItems.reduce((sum, i) => sum + parseGBP(i.amount), 0)
  const poTotal = poItems.reduce((sum, i) => sum + parseGBP(i.amount), 0)

  const financeStats = [
    {
      title: "Total Invoices",
      value: gbp.format(invoiceTotal),
      subtitle: `${invoiceItems.length} ${invoiceItems.length === 1 ? "Invoice" : "Invoices"}`,
      icon: FileText,
    },
    {
      title: "Total Purchase Orders",
      value: gbp.format(poTotal),
      subtitle: `${poItems.length} ${poItems.length === 1 ? "Purchase Order" : "Purchase Orders"}`,
      icon: ShoppingCart,
    },
  ]

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectNav projectId={params.id} />

        {/* Finance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {financeStats.map((stat) => (
            <Card key={stat.title} className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <stat.icon className="w-4 h-4 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions Bar — match Finance baseline */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search invoices and POs..." className="pl-10 w-64" />
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
        <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <colgroup>
                  <col style={{ width: "44px" }} />
                  <col style={{ width: "160px" }} />
                  <col />
                  <col style={{ width: "132px" }} />
                  <col style={{ width: "140px" }} />
                  <col style={{ width: "140px" }} />
                  <col style={{ width: "120px" }} />
                  <col style={{ width: "120px" }} />
                  <col style={{ width: "64px" }} />
                </colgroup>
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      <input type="checkbox" className="rounded border-gray-300" aria-label="Select all" />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
                      PO/IN Number
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Supplier</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
                      Date Issued
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="px-2 pr-4 py-3 text-right text-sm font-medium text-gray-600 w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {sampleData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          aria-label={`Select ${item.number}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{item.number}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.supplier}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.type}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.dateIssued}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.dueDate}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{item.amount}</td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={item.status}
                          label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        />
                      </td>
                      <td className="px-2 pr-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                              aria-label={`Actions for ${item.number}`}
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
