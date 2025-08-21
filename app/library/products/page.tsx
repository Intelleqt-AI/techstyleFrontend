"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Search,
  Filter,
  Heart,
  MoreHorizontal,
  Package,
} from "lucide-react";
import { LibraryNav } from "@/components/library-nav";
import { StatusBadge, TypeChip } from "@/components/chip";
import {
  ProductDetailSheet,
  type ProductDetails,
} from "@/components/product-detail-sheet";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "@/supabase/API";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import AddProductModal from "@/components/product/AddProductModal";

// Mock user permissions
const mockUser = { permissions: ["product.write"] };
const hasPerm = (permission: string) =>
  mockUser.permissions.includes(permission);

// Filter options
const options = ["Default", "Bookcase", "Shelves", "Lighting", "Wall decor"];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFilter, setSelectedFilter] = useState("Default");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<ProductDetails | undefined>(
    undefined
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const itemsPerPage = 12;

  const canAddProduct = hasPerm("product.write");

  // Fetch products using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "GetProducts",
      selectedCategory,
      searchQuery,
      currentPage,
      itemsPerPage,
      selectedFilter,
    ],
    queryFn: () =>
      getProduct({
        page: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchQuery || null,
        category: selectedCategory !== "All" ? selectedCategory : null,
        filter: selectedFilter !== "Default" ? selectedFilter : null,
      }),
  });

  // Function to handle adding a new product
  const handleAddProduct = (newProduct) => {
    // This would typically call an API to add the product
    console.log("Adding new product:", newProduct);
    // In a real implementation, we would update the state or refetch products
    setModalOpen(false);
  };

  const openDetails = useCallback((product) => {
    // Map the product to the details format expected by the sheet
    const productDetails: ProductDetails = {
      id: String(product.id),
      name: product.name,
      supplier: product.brand,
      images: [
        { src: product.image, alt: product.name },
        // Additional gallery examples
        { src: "/images/products/pleated-table-lamp.png", alt: "Alt angle" },
        { src: "/images/products/travertine-table-lamp.png", alt: "Detail" },
      ],
      prices: { retail: product.price, trade: undefined },
      productType: product.category,
      colour: product.tags?.[0],
      material: undefined,
      size: undefined,
      sku: undefined,
      stockStatus: product.inStock ? "In Stock" : "Confirm Stock",
      sampleAvailable: "No",
      measurements: undefined,
      description:
        "High-quality design piece curated for modern interiors. Materials and finish align with the studio's earthy palette.",
      tags: product.tags,
      url: undefined,
    };
    setSelected(productDetails);
    setSheetOpen(true);
  }, []);

  // Use the fetched data or fall back to mock data if not available
  // const products = data?.products || [];

  useEffect(() => {
    if (!isLoading) setProducts(data?.products);
  }, [data, isLoading]);

  // useEffect(() => {
  //   console.log(products.find((product) => product?.type));
  // }, [products]);

  // useEffect(() => {
  //   console.log(first)
  // }, [data, isLoading]);

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <LibraryNav />

        {/* Header - Single Line Layout */}
        <div className="mb-4 flex items-center justify-between gap-4">
          {/* Left side - Category filters */}
          <div className="flex gap-2">
            {["All", "Furniture", "Lighting", "Fabric", "Accessories"].map(
              (category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`h-9 ${
                    selectedCategory === category
                      ? "bg-gray-900 text-white"
                      : ""
                  }`}>
                  {category}
                </Button>
              )
            )}
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

            {/* <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  {selectedFilter}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 bg-white">
                <Command>
                  <CommandInput placeholder="Search filter..." />
                  <CommandList>
                    {options.map((option, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => setSelectedFilter(option)}
                        className="cursor-pointer">
                        {option}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover> */}

            {canAddProduct && (
              <Button className="h-9 gap-2" onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(itemsPerPage)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="h-64 rounded-md bg-gray-200 animate-pulse"></div>
                ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              Error loading products. Please try again later.
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">
                No products found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="group overflow-hidden transition-all duration-200 hover:shadow-lg">
                  <div className="relative">
                    {/* Clickable image to open Product Detail Sheet */}
                    <button
                      type="button"
                      onClick={() => openDetails(product)}
                      className="block w-full cursor-pointer"
                      aria-label={`View ${product.name}`}>
                      <div className="aspect-square overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            product.image ||
                            "/placeholder.svg?height=300&width=300&query=product+image"
                          }
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </button>

                    {/* Overlay Actions */}
                    <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 bg-white/90 p-0 hover:bg-white">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 bg-white/90 p-0 hover:bg-white">
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
                          aria-label={`Open ${product.name} details`}>
                          <h3 className="truncate text-sm font-semibold tracking-tight text-gray-900">
                            {product.name}
                          </h3>
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            {product.supplier}
                          </p>
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="tabular-nums text-sm font-semibold text-gray-900">
                          {product.priceRegular}
                        </span>
                        <TypeChip label={product.type} />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full bg-transparent opacity-0 transition-opacity group-hover:opacity-100"
                        disabled={!product.inStock}>
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
      <ProductDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        product={selected}
      />

      {/* Add Product Modal - You would need to create this component */}
      <AddProductModal
        closeModal={() => setModalOpen(false)}
        modalOpen={modalOpen}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
}
