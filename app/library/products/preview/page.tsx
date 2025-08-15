"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ProductDetailSheet, type ProductDetails } from "@/components/product-detail-sheet"

const demoProduct: ProductDetails = {
  id: "demo-pleated-lamp",
  name: "Pleated Table Lamp",
  supplier: "Soho Home",
  url: "https://example.com/products/pleated-table-lamp",
  images: [
    { src: "/images/products/pleated-table-lamp.png", alt: "Pleated table lamp" },
    { src: "/images/products/travertine-table-lamp.png", alt: "Travertine lamp" },
    { src: "/images/products/arched-mirror.png", alt: "Arched mirror" },
  ],
  prices: { retail: "£3,495", trade: "£2,971" },
  productType: "Lighting",
  colour: "Ivory",
  material: "Marble, Parchment",
  size: "Standard",
  sku: "SH-LAMP-PLT-01",
  stockStatus: "Confirm Stock",
  sampleAvailable: "No",
  measurements: "H52 × W40 × D40 cm",
  description:
    "An architectural stem carved from stone supports a wide pleated shade. Subtle texture and warm tone complement the studio’s earthy palette.",
  tags: ["Lighting", "Marble", "Parchment", "Table Lamp"],
}

export default function ProductPreviewPage() {
  const [open, setOpen] = React.useState(true)

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900">Product Detail Sheet Demo</h1>
        <Button onClick={() => setOpen(true)} className="bg-clay-600 text-white hover:bg-clay-700">
          Open Sheet
        </Button>
      </div>

      <p className="mt-2 text-sm text-neutral-600">
        This page demonstrates the right‑hand product detail sheet. Open it to see the best‑in‑class product view with
        images on the left and details on the right.
      </p>

      <ProductDetailSheet open={open} onOpenChange={setOpen} product={demoProduct} />
    </main>
  )
}
