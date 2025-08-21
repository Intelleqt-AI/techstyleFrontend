"use client";

import * as React from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, LinkIcon, Plus, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ProductImage = {
  src: string;
  alt?: string;
};

export type ProductDetails = {
  id: string;
  created_at: string;
  name: string;
  supplier?: string;
  priceMember?: string;
  priceRegular?: string;
  description?: string;
  measurements?: string;
  materials?: string;
  dimensions?: string;
  weight?: string;
  boxedDimensions?: string;
  boxedWeight?: string;
  assemblyRequired?: string;
  instructions?: string;
  composition?: string;
  construction?: string;
  feet?: number;
  filling?: string;
  frame?: string;
  removableCushions?: string;
  removableLegs?: string;
  seatDepth?: string;
  seatHeight?: string;
  seatWidth?: string;
  type?: string;
  product_url?: string;
  status?: string;
  imageURL?: string[];
  initialStatus?: string;
  qty?: number;
  delivery?: string | null;
  install?: string | null;
  sendToClient?: boolean;
  sample?: string;
  images: ProductImage[];
};

export type ProductDetailSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductDetails;
};

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-greige-500/30 bg-neutral-50 p-4",
        className
      )}>
      <div className="text-xs font-medium text-neutral-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-neutral-900">
        {value ?? "Not Available"}
      </div>
    </div>
  );
}

export function ProductDetailSheet({
  open,
  onOpenChange,
  product,
}: ProductDetailSheetProps) {
  const data = product;

  const [activeIdx, setActiveIdx] = React.useState(0);

  // Create a fallback image array if none provided
  const imageArray =
    data?.images?.length > 0
      ? data.images
      : [{ src: "/placeholder.svg?height=600&width=600", alt: data?.name }];

  const activeImage = imageArray[activeIdx] ?? {
    src: "/placeholder.svg?height=600&width=600",
    alt: data?.name,
  };

  function copyUrl() {
    if (!data?.product_url) return;
    navigator.clipboard.writeText(data.product_url).catch(() => {});
  }

  if (!data) {
    return null;
  }

  // Format prices with currency symbol
  const formatPrice = (price: string) => {
    if (!price) return "Not Available";
    return `$${price}`;
  };

  // Format boolean values
  const formatBoolean = (value: string) => {
    if (value === "true") return "Yes";
    if (value === "false") return "No";
    return value || "Not Available";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full p-0 sm:max-w-xl md:max-w-3xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle className="text-xl font-semibold text-neutral-900">
              {data.name}
            </SheetTitle>
            {data.supplier ? (
              <div className="text-sm text-neutral-600">
                Supplier: {data.supplier}
              </div>
            ) : null}
          </SheetHeader>

          <Separator className="mt-4" />

          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-6 p-6 md:grid-cols-2">
              {/* Left: gallery */}
              <section aria-label="Product images">
                <div className="overflow-hidden rounded-xl border border-greige-500/30 bg-white">
                  <div className="relative aspect-square">
                    <Image
                      src={activeImage.src}
                      alt={activeImage.alt ?? data.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </div>

                {imageArray.length > 1 && (
                  <div className="mt-3 flex gap-3 overflow-x-auto">
                    {imageArray.map((img, idx) => (
                      <button
                        key={img.src + idx}
                        type="button"
                        onClick={() => setActiveIdx(idx)}
                        className={cn(
                          "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition",
                          idx === activeIdx
                            ? "border-clay-600 ring-2 ring-clay-600/20"
                            : "border-greige-500/30 hover:border-greige-500/60"
                        )}
                        aria-label={`Show image ${idx + 1}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.src}
                          alt={img.alt ?? `Image ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Right: details */}
              <section className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {/* {data.product_url ? (
                    <a
                      href={data.product_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-md border border-greige-500/30 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50">
                      View Product
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  ) : null} */}
                  <Button
                    variant="outline"
                    className="border-greige-500/30 bg-white"
                    onClick={copyUrl}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                  <a
                    href={data.product_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-md border border-greige-500/30 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50">
                    <Share2 className="mr-2 h-4 w-4" />
                    Shere
                  </a>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <StatCard
                    label="Retail Price"
                    value={formatPrice(data.priceRegular)}
                  />
                  <StatCard
                    label="Trade Price"
                    value={formatPrice(data.priceMember)}
                  />
                  <StatCard label="Supplier" value={data.supplier} />
                  <StatCard label="Product Type" value={data.type} />
                  <StatCard label="Materials" value={data.materials} />
                  <StatCard label="Dimensions" value={data.dimensions} />
                  <StatCard label="Weight" value={data.weight} />
                  <StatCard label="Status" value={data.status} />
                  <StatCard label="Sample" value={data.sample} />
                  <StatCard label="Quantity" value={data.qty} />
                </div>

                {data.measurements && (
                  <div className="mt-2">
                    <h3 className="text-base font-semibold text-neutral-900">
                      Measurements
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      {data.measurements}
                    </p>
                  </div>
                )}

                {data.description ? (
                  <div className="mt-2">
                    <h3 className="text-base font-semibold text-neutral-900">
                      Description
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-neutral-700">
                      {data.description}
                    </p>
                  </div>
                ) : null}

                {/* Additional product details */}
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <StatCard
                    label="Assembly Required"
                    value={formatBoolean(data.assemblyRequired)}
                  />
                  <StatCard
                    label="Removable Cushions"
                    value={formatBoolean(data.removableCushions)}
                  />
                  <StatCard
                    label="Removable Legs"
                    value={formatBoolean(data.removableLegs)}
                  />
                  <StatCard label="Seat Depth" value={data.seatDepth} />
                  <StatCard label="Seat Height" value={data.seatHeight} />
                  <StatCard label="Seat Width" value={data.seatWidth} />
                  <StatCard label="Feet" value={data.feet} />
                  <StatCard label="Filling" value={data.filling} />
                  <StatCard label="Frame" value={data.frame} />
                  <StatCard label="Composition" value={data.composition} />
                  <StatCard label="Construction" value={data.construction} />
                </div>

                {/* Packaging information */}
                <div className="mt-2">
                  <h3 className="text-base font-semibold text-neutral-900">
                    Packaging Details
                  </h3>
                  <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <StatCard
                      label="Boxed Dimensions"
                      value={data.boxedDimensions}
                    />
                    <StatCard label="Boxed Weight" value={data.boxedWeight} />
                  </div>
                </div>

                {data.instructions && (
                  <div className="mt-2">
                    <h3 className="text-base font-semibold text-neutral-900">
                      Instructions
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-neutral-700">
                      {data.instructions}
                    </p>
                  </div>
                )}

                {/* Tags section */}
                <div className="mt-2">
                  <h3 className="text-base font-semibold text-neutral-900">
                    Product Details
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.type && (
                      <Badge
                        variant="secondary"
                        className="rounded-md bg-greige-100 text-taupe-700">
                        {data.type}
                      </Badge>
                    )}
                    {data.status && (
                      <Badge
                        variant="secondary"
                        className="rounded-md bg-greige-100 text-taupe-700">
                        Status: {data.status}
                      </Badge>
                    )}
                    {data.initialStatus && (
                      <Badge
                        variant="secondary"
                        className="rounded-md bg-greige-100 text-taupe-700">
                        Initial Status: {data.initialStatus}
                      </Badge>
                    )}
                    {data.sendToClient !== undefined && (
                      <Badge
                        variant="secondary"
                        className="rounded-md bg-greige-100 text-taupe-700">
                        Send to Client: {data.sendToClient ? "Yes" : "No"}
                      </Badge>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Sticky footer actions */}
          <div className="border-t border-greige-500/30 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-neutral-600">
                Add this product to a project.
              </div>
              <div className="flex gap-2">
                {data.product_url ? (
                  <a
                    href={data.product_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-md border border-greige-500/30 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
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
  );
}
