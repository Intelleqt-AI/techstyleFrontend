"use client"

import * as React from "react"
import Image from "next/image"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, LinkIcon, Plus, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

type ProductImage = {
  src: string
  alt?: string
}

export type ProductDetails = {
  id: string
  name: string
  supplier?: string
  url?: string
  images: ProductImage[]
  prices?: { retail?: string; trade?: string }
  productType?: string
  colour?: string
  material?: string
  size?: string
  sku?: string
  stockStatus?: string
  sampleAvailable?: "Yes" | "No" | "Requested"
  measurements?: string
  description?: string
  tags?: string[]
}

export type ProductDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: ProductDetails
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string
  value?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-lg border border-greige-500/30 bg-neutral-50 p-4", className)}>
      <div className="text-xs font-medium text-neutral-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-neutral-900">{value ?? "Not Available"}</div>
    </div>
  )
}

export function ProductDetailSheet({ open, onOpenChange, product }: ProductDetailSheetProps) {
  const data =
    product ??
    ({
      id: "demo",
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
    } as ProductDetails)

  const [activeIdx, setActiveIdx] = React.useState(0)
  const activeImage = data.images?.[activeIdx] ?? { src: "/placeholder.svg?height=600&width=600" }

  function copyUrl() {
    if (!data.url) return
    navigator.clipboard.writeText(data.url).catch(() => {})
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-xl md:max-w-3xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle className="text-xl font-semibold text-neutral-900">{data.name}</SheetTitle>
            {data.supplier ? <div className="text-sm text-neutral-600">Supplier: {data.supplier}</div> : null}
          </SheetHeader>

          <Separator className="mt-4" />

          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-6 p-6 md:grid-cols-2">
              {/* Left: gallery */}
              <section aria-label="Product images">
                <div className="overflow-hidden rounded-xl border border-greige-500/30 bg-white">
                  <div className="relative aspect-square">
                    <Image
                      src={activeImage.src || "/placeholder.svg?height=800&width=800&query=product+image"}
                      alt={activeImage.alt ?? data.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </div>

                {data.images?.length ? (
                  <div className="mt-3 flex gap-3 overflow-x-auto">
                    {data.images.map((img, idx) => (
                      <button
                        key={img.src + idx}
                        type="button"
                        onClick={() => setActiveIdx(idx)}
                        className={cn(
                          "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition",
                          idx === activeIdx
                            ? "border-clay-600 ring-2 ring-clay-600/20"
                            : "border-greige-500/30 hover:border-greige-500/60",
                        )}
                        aria-label={`Show image ${idx + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.src || "/placeholder.svg?height=64&width=64&query=product+thumb"}
                          alt={img.alt ?? `Image ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </section>

              {/* Right: details */}
              <section className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {data.url ? (
                    <a
                      href={data.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-md border border-greige-500/30 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      View Product
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  ) : null}
                  <Button variant="outline" className="border-greige-500/30 bg-white" onClick={copyUrl}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                  <Button variant="outline" className="border-greige-500/30 bg-white">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <StatCard label="Retail Price" value={data.prices?.retail} />
                  <StatCard label="Trade Price" value={data.prices?.trade} />
                  <StatCard label="Supplier" value={data.supplier} />
                  <StatCard label="Product Type" value={data.productType} />
                  <StatCard label="Colour" value={data.colour} />
                  <StatCard label="Material" value={data.material} />
                  <StatCard label="Size" value={data.size} />
                  <StatCard label="SKU" value={data.sku} />
                  <StatCard label="Stock Status" value={data.stockStatus} />
                  <StatCard label="Sample Available" value={data.sampleAvailable} />
                </div>

                <div className="mt-2">
                  <h3 className="text-base font-semibold text-neutral-900">Measurements</h3>
                  <p className="mt-1 text-sm text-neutral-600">{data.measurements ?? "Not Available"}</p>
                </div>

                {data.description ? (
                  <div className="mt-2">
                    <h3 className="text-base font-semibold text-neutral-900">Description</h3>
                    <p className="mt-1 text-sm leading-6 text-neutral-700">{data.description}</p>
                  </div>
                ) : null}

                {data.tags?.length ? (
                  <div className="mt-2">
                    <h3 className="text-base font-semibold text-neutral-900">Tags</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {data.tags.map((t) => (
                        <Badge key={t} variant="secondary" className="rounded-md bg-greige-100 text-taupe-700">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            </div>
          </div>

          {/* Sticky footer actions */}
          <div className="border-t border-greige-500/30 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-neutral-600">Add this product to a project.</div>
              <div className="flex gap-2">
                {data.url ? (
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-md border border-greige-500/30 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    View Product
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                ) : null}
                <Button className="bg-clay-600 text-white hover:bg-clay-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
