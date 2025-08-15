"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, Filter, Heart, MoreHorizontal, Package } from "lucide-react"
import { LibraryNav } from "@/components/library-nav"
import { StatusBadge, TypeChip } from "@/components/chip"
import { ProductDetailSheet, type ProductDetails } from "@/components/product-detail-sheet"

// Mock user permissions
const mockUser = { permissions: ["product.write"] }
const hasPerm = (permission: string) => mockUser.permissions.includes(permission)

// Product data
const products = [
  {
    id: 1,
    name: "Quilted Lounge Chair",
    brand: "MODERN COMFORT",
    price: "£2,850",
    category: "Furniture",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-08-06%20at%2021.17.00-JZhCngS63aIY6mM7q5e4ZZN79ZUNg4.png",
    inStock: true,
    tags: ["Modern", "Quilted", "Lounge", "Beige"],
  },
  {
    id: 2,
    name: "Orbital Brass Chandelier",
    brand: "LUMINA DESIGN",
    price: "£1,450",
    category: "Lighting",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-08-06%20at%2021.17.53-z9iZC0HFblIZ8dFEwtenIdIU5liXrZ.png",
    inStock: true,
    tags: ["Brass", "Modern", "Chandelier", "Globe"],
  },
  {
    id: 3,
    name: "Abstract Canvas Art",
    brand: "CONTEMPORARY ART CO",
    price: "£890",
    category: "Accessories",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KoDPSj9KAqS9ENjYFcyKuhuGuxan8F.png",
    inStock: true,
    tags: ["Abstract", "Canvas", "Colorful", "Wall Art"],
  },
  {
    id: 4,
    name: "Mid-Century Accent Chair",
    brand: "DANISH MODERN",
    price: "£1,650",
    category: "Furniture",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-08-06%20at%2021.17.31-TxPdRjr9HQZtamxMF8sCg9Uy45iu1a.png",
    inStock: true,
    tags: ["Mid-Century", "Wood Frame", "Accent", "Cream"],
  },
  // Provided local assets
  {
    id: 5,
    name: "Terracotta Dome Table Lamp",
    brand: "LUMINA ATELIER",
    price: "£1,299",
    category: "Lighting",
    image: "/images/library/lamp.png",
    inStock: true,
    tags: ["Table Lamp", "Terracotta", "Mint Stem", "Brass"],
  },
  {
    id: 6,
    name: "Ball-Edge Arch Mirror",
    brand: "STUDIO WOODWORKS",
    price: "£599",
    category: "Accessories",
    image: "/images/library/mirror.png",
    inStock: true,
    tags: ["Mirror", "Wood", "Arched", "Beaded Frame"],
  },
]

const categories = ["All", "Furniture", "Lighting", "Fabric", "Accessories"]

// Map a product from this grid to ProductDetails used by the sheet
function mapToDetails(p: (typeof products)[number]): ProductDetails {
  return {
    id: String(p.id),
    name: p.name,
    supplier: p.brand,
    images: [
      { src: p.image, alt: p.name },
      // Additional gallery examples (reuse local assets if available)
      { src: "/images/products/pleated-table-lamp.png", alt: "Alt angle" },
      { src: "/images/products/travertine-table-lamp.png", alt: "Detail" },
    ],
    prices: { retail: p.price, trade: undefined },
    productType: p.category,
    colour: p.tags?.[0],
    material: undefined,
    size: undefined,
    sku: undefined,
    stockStatus: p.inStock ? "In Stock" : "Confirm Stock",
    sampleAvailable: "No",
    measurements: undefined,
    description:
      "High-quality design piece curated for modern interiors. Materials and finish align with the studio’s earthy palette.",
    tags: p.tags,
    url: undefined, // populate if you have a source URL
  }
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selected, setSelected] = useState<ProductDetails | undefined>(undefined)
  const canAddProduct = hasPerm("product.write")

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.tags.some((tag) => tag.toLowerCase().includes(q))
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const openDetails = useCallback((p: (typeof products)[number]) => {
    setSelected(mapToDetails(p))
    setSheetOpen(true)
  }, [])

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <LibraryNav />

        {/* Header - Single Line Layout */}
        <div className="mb-4 flex items-center justify-between gap-4">
          {/* Left side - Category filters */}
          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`h-9 ${selectedCategory === category ? "bg-gray-900 text-white" : ""}`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Right side - Search and actions */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search Product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-48 pl-10"
              />
            </div>

            <Button variant="outline" className="h-9 gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Default
            </Button>

            {canAddProduct && (
              <Button className="h-9 gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">No products found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden transition-all duration-200 hover:shadow-lg">
                  <div className="relative">
                    {/* Clickable image to open Product Detail Sheet */}
                    <button
                      type="button"
                      onClick={() => openDetails(product)}
                      className="block w-full cursor-pointer"
                      aria-label={`View ${product.name}`}
                    >
                      <div className="aspect-square overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image || "/placeholder.svg?height=300&width=300&query=product+image"}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </button>

                    {/* Overlay Actions */}
                    <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button size="sm" variant="secondary" className="h-8 w-8 bg-white/90 p-0 hover:bg-white">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" className="h-8 w-8 bg-white/90 p-0 hover:bg-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Stock Status */}
                    {!product.inStock && (
                      <div className="absolute left-3 top-3">
                        <StatusBadge status="Out of Stock" />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2.5">
                      <div>
                        {/* Clickable title also opens details */}
                        <button
                          type="button"
                          onClick={() => openDetails(product)}
                          className="text-left"
                          aria-label={`Open ${product.name} details`}
                        >
                          <h3 className="truncate text-sm font-semibold tracking-tight text-gray-900">
                            {product.name}
                          </h3>
                          <p className="text-xs uppercase tracking-wide text-gray-500">{product.brand}</p>
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="tabular-nums text-sm font-semibold text-gray-900">{product.price}</span>
                        <TypeChip label={product.category} />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full bg-transparent opacity-0 transition-opacity group-hover:opacity-100"
                        disabled={!product.inStock}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add to Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Sheet */}
      <ProductDetailSheet open={sheetOpen} onOpenChange={setSheetOpen} product={selected} />
    </div>
  )
}
