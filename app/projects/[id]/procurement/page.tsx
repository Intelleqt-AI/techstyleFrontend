"use client"

import { useState, useMemo } from "react"
import { ProjectNav } from "@/components/project-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/chip"
import {
  Package,
  Hash,
  Clock,
  DollarSign,
  Truck,
  Plus,
  Filter,
  Search,
  MessageSquare,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ProductDetailSheet, type ProductDetails } from "@/components/product-detail-sheet"

// Top summary
const procurementStats = [
  { title: "Total Items", value: "8", subtitle: "Products specified", icon: Package },
  { title: "Total Quantity", value: "17", subtitle: "Units ordered", icon: Hash },
  { title: "Pending Approval", value: "2", subtitle: "Waiting for sign-off", icon: Clock },
  { title: "Total Cost", value: "£11,610.00", subtitle: "Estimated cost", icon: DollarSign },
  { title: "Delivery Progress", value: "38%", subtitle: "3 of 8 delivered", icon: Truck },
]

// Table rows (future-dated)
type ApprovalStatus = "approved" | "pending" | "rejected"
type ProcurementItem = {
  id: number
  name: string
  image: string
  dimensions: string
  date: string
  leadTime: string
  quantity: number
  price: string
  status: "ordered" | "pending" | "delivered"
  supplier: string
  poNumber: string
  sample: "Yes" | "No" | "Requested"
  clientApproval: ApprovalStatus
}

// Use real assets added to /public/images/products
const procurementItems: ProcurementItem[] = [
  {
    id: 1,
    name: "Italian Leather Sofa",
    image: "/images/products/leather-ottoman.png",
    dimensions: "220 x 95 x 85cm",
    date: "2025-08-20",
    leadTime: "8-10 weeks",
    quantity: 1,
    price: "£3,200.00",
    status: "ordered",
    supplier: "West Elm",
    poNumber: "PO-24051",
    sample: "Requested",
    clientApproval: "approved",
  },
  {
    id: 2,
    name: "Marble Coffee Table",
    image: "/images/products/arched-mirror.png",
    dimensions: "120 x 60 x 45cm",
    date: "2025-08-22",
    leadTime: "6-8 weeks",
    quantity: 1,
    price: "£1,850.00",
    status: "pending",
    supplier: "John Lewis",
    poNumber: "PO-24052",
    sample: "Yes",
    clientApproval: "pending",
  },
  {
    id: 3,
    name: "Designer Floor Lamp",
    image: "/images/products/pleated-table-lamp.png",
    dimensions: "30 x 30 x 165cm",
    date: "2025-08-24",
    leadTime: "4-6 weeks",
    quantity: 2,
    price: "£450.00",
    status: "delivered",
    supplier: "Habitat",
    poNumber: "PO-24053",
    sample: "Yes",
    clientApproval: "approved",
  },
  {
    id: 4,
    name: "Velvet Dining Chairs",
    image: "/images/products/striped-armchair.png",
    dimensions: "55 x 60 x 85cm",
    date: "2025-08-26",
    leadTime: "3-4 weeks",
    quantity: 6,
    price: "£280.00",
    status: "ordered",
    supplier: "Made.com",
    poNumber: "PO-24054",
    sample: "No",
    clientApproval: "pending",
  },
  {
    id: 5,
    name: "Persian Area Rug",
    image: "/images/products/woven-dining-chair.png",
    dimensions: "300 x 200cm",
    date: "2025-08-28",
    leadTime: "2-3 weeks",
    quantity: 1,
    price: "£1,200.00",
    status: "pending",
    supplier: "The Rug Company",
    poNumber: "PO-24055",
    sample: "Requested",
    clientApproval: "rejected",
  },
  {
    id: 6,
    name: "Crystal Chandelier",
    image: "/images/products/travertine-table-lamp.png",
    dimensions: "80 x 80 x 100cm",
    date: "2025-09-02",
    leadTime: "12-14 weeks",
    quantity: 1,
    price: "£2,800.00",
    status: "ordered",
    supplier: "Harrods",
    poNumber: "PO-24056",
    sample: "Yes",
    clientApproval: "approved",
  },
  {
    id: 7,
    name: "Oak Dining Table",
    image: "/images/products/studded-dresser.png",
    dimensions: "200 x 100 x 75cm",
    date: "2025-09-05",
    leadTime: "10-12 weeks",
    quantity: 1,
    price: "£1,650.00",
    status: "delivered",
    supplier: "Heal's",
    poNumber: "PO-24057",
    sample: "Yes",
    clientApproval: "approved",
  },
  {
    id: 8,
    name: "Brass Wall Sconces",
    image: "/images/products/fringed-parasol.png",
    dimensions: "15 x 25 x 30cm",
    date: "2025-09-08",
    leadTime: "6-8 weeks",
    quantity: 4,
    price: "£180.00",
    status: "pending",
    supplier: "Lights.co.uk",
    poNumber: "PO-24058",
    sample: "No",
    clientApproval: "pending",
  },
]

function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const label = status === "approved" ? "Approved" : status === "pending" ? "Pending" : "Rejected"
  return <StatusBadge status={status} label={label} />
}

function useProductMap(items: ProcurementItem[]) {
  return useMemo<Record<number, ProductDetails>>(
    () =>
      Object.fromEntries(
        items.map((it) => [
          it.id,
          {
            id: String(it.id),
            name: it.name,
            supplier: it.supplier,
            url: "https://example.com/products/" + encodeURIComponent(it.name.toLowerCase().replace(/\s+/g, "-")),
            images: [
              { src: it.image, alt: it.name },
              // provide a couple of sensible fallbacks to let users flip thumbnails
              { src: "/images/products/pleated-table-lamp.png", alt: "Alt view" },
              { src: "/images/products/arched-mirror.png", alt: "Alt view 2" },
            ],
            prices: { retail: it.price },
            size: it.dimensions,
            stockStatus:
              it.status === "delivered" ? "Delivered" : it.status === "ordered" ? "Ordered" : "Confirm Stock",
            sampleAvailable: it.sample === "Requested" ? "Requested" : it.sample,
            measurements: it.dimensions,
            description:
              "High-quality piece specified for the project. Materials and finish align with the studio palette.",
            tags: ["Procurement", "Specified"],
          } as ProductDetails,
        ]),
      ),
    [items],
  )
}

export default function ProjectProcurementPage({ params }: { params: { id: string } }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<ProductDetails | undefined>(undefined)
  const productMap = useProductMap(procurementItems)

  function openProduct(id: number) {
    const p = productMap[id]
    setSelected(p ?? undefined)
    setOpen(true)
  }

  return (
    <div className="flex-1 bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectNav projectId={params.id} />

        {/* Top stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {procurementStats.map((stat) => (
            <Card key={stat.title} className="border border-greige-500/30 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <stat.icon className="w-4 h-4 text-slatex-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-700">{stat.title}</p>
                    <p className="text-lg font-semibold text-neutral-900">{stat.value}</p>
                    <p className="text-xs text-neutral-600">{stat.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input placeholder="Search items..." className="pl-10 w-64 h-9" />
            </div>
            <Button variant="outline" size="sm" className="h-9 bg-transparent border-greige-500/30">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button className="bg-clay-600 text-white hover:bg-clay-700">
              <Plus className="w-4 h-4 mr-2" />
              Create PO
            </Button>
            <Button variant="outline" className="border-greige-500/30 bg-transparent">
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments
            </Button>
            <Button variant="outline" className="border-greige-500/30 bg-transparent">
              Client Portal
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card className="border border-greige-500/30 shadow-sm overflow-hidden rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <colgroup>
                  <col style={{ width: 44 }} />
                  <col />
                  <col style={{ width: 180 }} />
                  <col style={{ width: 120 }} /> {/* PO # */}
                  <col style={{ width: 112 }} /> {/* Sample */}
                  <col style={{ width: 120 }} /> {/* Order Date */}
                  <col style={{ width: 120 }} /> {/* Lead Time */}
                  <col style={{ width: 60 }} /> {/* Qty */}
                  <col style={{ width: 120 }} /> {/* Price */}
                  <col style={{ width: 112 }} /> {/* Status */}
                  <col style={{ width: 120 }} /> {/* Approval */}
                  <col style={{ width: 64 }} /> {/* Actions */}
                </colgroup>
                <thead className="bg-neutral-50 border-b border-greige-500/30 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                      <input type="checkbox" className="rounded border-greige-500/30" aria-label="Select all items" />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Item</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Dimensions</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">PO #</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Sample</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Order Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Lead Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Qty</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Approval</th>
                    <th className="pl-4 pr-6 py-3 text-right text-sm font-medium text-neutral-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-sm">
                  {procurementItems.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-greige-500/30"
                          aria-label={`Select ${item.name}`}
                        />
                      </td>

                      {/* Item cell with thumbnail button to open sheet */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => openProduct(item.id)}
                            className="shrink-0 focus:outline-none focus:ring-2 focus:ring-clay-600 rounded-lg"
                            aria-label={`View ${item.name}`}
                            title={`View ${item.name}`}
                          >
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover border border-greige-500/30 bg-white"
                            />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-neutral-900 whitespace-nowrap truncate" title={item.name}>
                              {item.name}
                            </div>
                            <div className="text-xs text-neutral-600 whitespace-nowrap truncate" title={item.supplier}>
                              {item.supplier}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate" title={item.dimensions}>
                        {item.dimensions}
                      </td>

                      <td className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate" title={item.poNumber}>
                        {item.poNumber}
                      </td>
                      <td className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate" title={item.sample}>
                        {item.sample}
                      </td>

                      <td className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate" title={item.date}>
                        {item.date}
                      </td>
                      <td className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate" title={item.leadTime}>
                        {item.leadTime}
                      </td>
                      <td
                        className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate"
                        title={String(item.quantity)}
                      >
                        {item.quantity}
                      </td>
                      <td
                        className="px-4 py-3 font-medium text-neutral-900 tabular-nums whitespace-nowrap truncate"
                        title={item.price}
                      >
                        {item.price}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={item.status}
                          label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <ApprovalBadge status={item.clientApproval} />
                      </td>

                      <td className="pl-4 pr-6 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                              aria-label={`Open actions for ${item.name}`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openProduct(item.id)}>View details</DropdownMenuItem>
                            <DropdownMenuItem>Update status</DropdownMenuItem>
                            <DropdownMenuItem>Download PO</DropdownMenuItem>
                            <DropdownMenuItem>Contact supplier</DropdownMenuItem>
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

      {/* Product detail sheet */}
      <ProductDetailSheet open={open} onOpenChange={setOpen} product={selected} />
    </div>
  )
}
