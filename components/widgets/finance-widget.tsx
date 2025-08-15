"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Clock } from "lucide-react"

const financeData = {
  totalRevenue: "£425,000",
  monthlyGrowth: "+12%",
  pendingInvoices: "£45,000",
  overdueAmount: "£8,500",
}

const recentInvoices = [
  {
    id: "INV-001",
    client: "Smith Family",
    amount: "£25,000",
    status: "paid",
    date: "Nov 1",
  },
  {
    id: "INV-002",
    client: "TechCorp Inc.",
    amount: "£15,000",
    status: "pending",
    date: "Nov 3",
  },
  {
    id: "INV-003",
    client: "Grandeur Hotels",
    amount: "£8,500",
    status: "overdue",
    date: "Oct 25",
  },
]

export function FinanceWidget() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Finance Overview</CardTitle>
        <Button variant="ghost" size="sm">
          View all
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-sage-300/20 border border-sage-500/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-olive-700" />
              <span className="text-xs font-medium text-olive-700">Revenue</span>
            </div>
            <div className="text-lg font-semibold text-neutral-900">{financeData.totalRevenue}</div>
            <div className="text-xs text-olive-700">{financeData.monthlyGrowth}</div>
          </div>

          <div className="p-3 rounded-lg bg-ochre-300/20 border border-ochre-700/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-ochre-700" />
              <span className="text-xs font-medium text-ochre-700">Pending</span>
            </div>
            <div className="text-lg font-semibold text-neutral-900">{financeData.pendingInvoices}</div>
            <div className="text-xs text-ochre-700">2 invoices</div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div>
          <h4 className="font-medium text-sm text-neutral-900 mb-3">Recent Invoices</h4>
          <div className="space-y-2">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-2 rounded-md hover:bg-neutral-50">
                <div>
                  <div className="font-medium text-sm text-neutral-900">{invoice.id}</div>
                  <div className="text-xs text-neutral-500">
                    {invoice.client} • {invoice.date}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm text-neutral-900">{invoice.amount}</div>
                  <Badge
                    className={`text-xs ${
                      invoice.status === "paid"
                        ? "bg-sage-300/30 text-olive-700 border border-olive-700/20"
                        : invoice.status === "pending"
                          ? "bg-ochre-300/20 text-ochre-700 border border-ochre-700/20"
                          : "bg-terracotta-600/10 text-terracotta-600 border border-terracotta-600/30"
                    }`}
                  >
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
