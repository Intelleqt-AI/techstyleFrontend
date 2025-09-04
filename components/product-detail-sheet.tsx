'use client';

import * as React from 'react';
import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, LinkIcon, Plus, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Slider from 'react-slick';
import { toast } from 'sonner';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { modifyProjectForTypeProduct } from '@/supabase/API';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Input } from './ui/input';
import useProjects from '@/supabase/hook/useProject';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

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

function StatCard({ label, value, className }: { label: string; value?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg border border-greige-500/30 bg-neutral-50 p-4', className)}>
      <div className="text-xs  truncate font-medium text-neutral-500">{label}</div>
      <div className="mt-1 text-sm capitalize font-semibold text-neutral-900">{value || 'Not Available'}</div>
    </div>
  );
}

export function ProductDetailSheet({ open, onOpenChange, product }: ProductDetailSheetProps) {
  const data = product;
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [types, setTypes] = React.useState([]);
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [qty, setQty] = React.useState(1);
  const { data: projectsData, isLoading: projectsLoading, error: projectsError, refetch } = useProjects();
  const [selectedProductId, setSelectedProductId] = React.useState(null);

  const typeMutation = useMutation({
    mutationFn: modifyProjectForTypeProduct,
    onSuccess: () => {
      toast('Product Added');
      queryClient.invalidateQueries(['getProductByProjectID']);
    },
    onError: error => {
      console.log(error);
      toast(error.message);
    },
  });

  // Create a fallback image array if none provided
  const activeImage = data?.images[activeIdx] ?? {
    src: '/placeholder.svg?height=600&width=600',
  };

  function copyUrl() {
    if (!data?.product_url) return;
    navigator.clipboard.writeText(data.product_url).catch(() => {});
    toast.success('Copied !');
  }

  if (!data) {
    return null;
  }

  // Format prices with currency symbol
  const formatPrice = (price: string) => {
    if (!price) return 'Not Available';
    return `$${Number(price).toLocaleString()}`;
  };

  // Format boolean values
  const formatBoolean = (value: string) => {
    if (value === 'true') return 'Yes';
    if (value === 'false') return 'No';
    return value || 'Not Available';
  };

  function closeModal() {
    setModalOpen(false);
    setTypes([]);
    setSelectedType(null);
    setQty(1);
  }

  // Submit types
  const handleSubmit = e => {
    e.preventDefault();
    const finalProduct = {
      id: selectedProductId,
      qty: qty,
      status: 'pending',
      install: null,
      delivery: null,
      sendToClient: false,
      initialStatus: 'Draft',
    };
    if (selectedType) {
      typeMutation.mutate({
        finalProduct,
        projectID: types.id,
        typeID: selectedType,
      });
      closeModal();
    }
  };

  const handleOpenTypeModal = project => {
    setTypes(project);
    setModalOpen(true);
  };

  const handleAddToProject = (id: string) => {
    toast.warning('No Room ! Please Add Room');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-xl md:max-w-3xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle className="text-xl font-semibold text-neutral-900">{data?.name}</SheetTitle>
            {data?.supplier ? <div className="text-sm text-neutral-600">Supplier: {data?.supplier}</div> : null}
          </SheetHeader>

          <Separator className="mt-4" />

          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-6 p-6 md:grid-cols-2">
              {/* Left: gallery */}
              <section aria-label="Product images">
                <div className="overflow-hidden rounded-xl border border-greige-500/30 bg-white">
                  <div className="relative aspect-square">
                    {data?.images?.length > 0 && (
                      <Image src={activeImage} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                    )}
                    {/* {product?.images?.length > 0 && (
                      <Slider {...settings}>
                        {product.images.map((image, index) => (
                          <div key={index} className="h-full  rounded-[10px] overflow-hidden">
                            <Image
                              width={400}
                              height={400}
                              className="h-[400px] w-full object-contain"
                              src={image}
                              alt={`Product image ${index + 1}`}
                            />
                          </div>
                        ))}
                      </Slider>
                    )} */}
                  </div>
                </div>

                {data?.images?.length > 1 && (
                  <div className="mt-3 flex gap-3 overflow-x-auto">
                    {data?.images?.map((img, idx) => (
                      <button
                        key={img.src + idx}
                        type="button"
                        onClick={() => setActiveIdx(idx)}
                        className={cn(
                          'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition',
                          idx === activeIdx ? 'border-clay-600 ring-2 ring-clay-600/20' : 'border-greige-500/30 hover:border-greige-500/60'
                        )}
                        aria-label={`Show image ${idx + 1}`}
                      >
                        <img src={img} className="h-full w-full object-cover" />
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
                  <Button variant="outline" className="border-greige-500/30 bg-white" onClick={copyUrl}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                  <Link
                    href={data?.product_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 border-greige-500/30 bg-white"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Shere
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <StatCard label="Retail Price" value={formatPrice(data?.priceRegular)} />
                  <StatCard label="Trade Price" value={formatPrice(data?.priceMember)} />
                  <StatCard label="Supplier" value={data?.supplier} />
                  <StatCard label="Product Type" value={data?.type} />
                  <StatCard label="Materials" value={data?.materials} />
                  <StatCard label="Dimensions" value={data.dimensions} />
                  <StatCard label="Weight" value={data.weight} />
                  <StatCard label="Status" value={data.status} />
                  <StatCard label="Sample" value={data.sample} />
                  <StatCard label="Quantity" value={data.qty} />
                </div>

                {data.measurements && (
                  <div className="mt-2">
                    <h3 className="text-base font-semibold text-neutral-900">Measurements</h3>
                    <p className="mt-1 text-sm text-neutral-600">{data.measurements}</p>
                  </div>
                )}

                {data.description ? (
                  <div className="mt-2">
                    <h3 className="text-base font-semibold text-neutral-900">Description</h3>
                    <p className="mt-1 text-sm leading-6 text-neutral-700">{data.description}</p>
                  </div>
                ) : null}

                {/* Additional product details */}
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <StatCard label="Assembly Required" value={formatBoolean(data.assemblyRequired)} />
                  <StatCard label="Removable Cushions" value={formatBoolean(data.removableCushions)} />
                  <StatCard label="Removable Legs" value={formatBoolean(data.removableLegs)} />
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
                  <h3 className="text-base font-semibold text-neutral-900">Packaging Details</h3>
                  <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <StatCard label="Boxed Dimensions" value={data.boxedDimensions} />
                    <StatCard label="Boxed Weight" value={data.boxedWeight} />
                  </div>
                </div>

                {data.instructions && (
                  <div className="mt-2">
                    <h3 className="text-base font-semibold text-neutral-900">Instructions</h3>
                    <p className="mt-1 text-sm leading-6 text-neutral-700">{data.instructions}</p>
                  </div>
                )}

                {/* Tags section */}
                <div className="mt-2">
                  <h3 className="text-base font-semibold text-neutral-900">Product Details</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.type && (
                      <Badge variant="secondary" className="rounded-md bg-greige-100 text-taupe-700">
                        {data.type}
                      </Badge>
                    )}
                    {data.status && (
                      <Badge variant="secondary" className="rounded-md bg-greige-100 text-taupe-700">
                        Status: <span className=" capitalize">{data.status}</span>
                      </Badge>
                    )}
                    {data.initialStatus && (
                      <Badge variant="secondary" className="rounded-md bg-greige-100 text-taupe-700">
                        Initial Status: {data.initialStatus}
                      </Badge>
                    )}
                    {data.sendToClient !== undefined && (
                      <Badge variant="secondary" className="rounded-md bg-greige-100 text-taupe-700">
                        Send to Client: {data.sendToClient ? 'Yes' : 'No'}
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
              <div className="text-sm text-neutral-600">Add this product to a project.</div>
              <div className="flex gap-2">
                {data.product_url ? (
                  <a
                    href={data.product_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-shrink-0 items-center rounded-md border border-greige-500/30 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    View Product
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                ) : null}

                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full">
                    <Button className="bg-clay-600 text-white hover:bg-clay-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Project
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-w-[300px] max-h-[300px] overflow-scroll bg-white">
                    {!projectsLoading &&
                      projectsData?.map(project => (
                        <DropdownMenuItem
                          key={project?.id}
                          onClick={() => {
                            setSelectedProductId(product?.id);
                            if (Array.isArray(project?.type) && project.type.length > 0) {
                              handleOpenTypeModal(project);
                            } else {
                              handleAddToProject(project?.id);
                            }
                          }}
                          className="cursor-pointer"
                        >
                          {project.name}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>

      <Dialog open={modalOpen} onOpenChange={open => (!open ? closeModal() : null)}>
        <DialogContent className="sm:max-w-[500px] flex flex-col py-6 z-[9999]">
          {/* Header */}
          <DialogHeader className="flex items-center justify-between px-4">
            <DialogTitle className="text-sm font-semibold">Select Project Room</DialogTitle>
          </DialogHeader>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between px-6 space-y-4">
            <div className="flex-1 w-full  flex flex-col items-start justify-center">
              <RadioGroup value={selectedType} onValueChange={setSelectedType}>
                {Array.isArray(types?.type) &&
                  types?.type.length > 0 &&
                  types?.type.map(type => (
                    <div key={type?.id} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value={type?.id} id={type?.id} className="w-5 h-5" />
                      <label htmlFor={type?.id} className="text-[18px] font-normal cursor-pointer">
                        {type?.text}
                      </label>
                    </div>
                  ))}
              </RadioGroup>
              <div
                className={`mt-6 w-full overflow-hidden transition-all duration-300 ease-in-out
          ${selectedType ? 'opacity-100 translate-y-0 max-h-40 py-2' : 'opacity-0 -translate-y-2 max-h-0'}`}
                aria-hidden={!selectedType}
              >
                <p className="mb-2">Quantity</p>
                <Input
                  className="outline-none ring-0 focus:ring-0"
                  type="number"
                  value={qty}
                  onChange={e => setQty(e.target.value)}
                  placeholder="Enter Product Quantity"
                />
              </div>
            </div>

            <DialogFooter className="flex justify-between items-center px-0">
              <Button className="w-full" type="submit" disabled={!selectedType}>
                Add
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
