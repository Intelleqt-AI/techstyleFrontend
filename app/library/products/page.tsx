'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Modal from 'react-modal';
import { Plus, Search, Filter, Heart, MoreHorizontal, Package, ChevronDown } from 'lucide-react';
import { LibraryNav } from '@/components/library-nav';
import { StatusBadge, TypeChip } from '@/components/chip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ProductDetailSheet, type ProductDetails } from '@/components/product-detail-sheet';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProduct, modifyProjectForTypeProduct } from '@/supabase/API';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command';
import AddProductModal from '@/components/product/AddProductModal';
import useProjects from '@/supabase/hook/useProject';
import { toast } from 'sonner';
import EditProductModal from '@/components/product/EditProductModal';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Mock user permissions
const mockUser = { permissions: ['product.write'] };
const hasPerm = (permission: string) => mockUser.permissions.includes(permission);

// Filter options
const options = ['Default', 'Bookcase', 'Shelves', 'Lighting', 'Wall decor'];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFilter, setSelectedFilter] = useState('Default');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<ProductDetails | undefined>(undefined);
  const [addProductmodalOpen, setAddProductModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [confirmText, setConfirmText] = useState('Are you sure you want to delete ?');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [editModal, setEditModal] = useState(false);

  function closeEditModal() {
    setEditModal(false);
  }

  const itemsPerPage = 12;
  const queryClient = useQueryClient();

  const canAddProduct = hasPerm('product.write');

  const { data: projectsData, isLoading: projectsLoading, error: projectsError, refetch } = useProjects();

  // Fetch products using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['GetProducts', selectedCategory, searchQuery, currentPage, itemsPerPage, selectedFilter],
    queryFn: () =>
      getProduct({
        page: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchQuery || null,
        category: selectedCategory !== 'All' ? selectedCategory : null,
        filter: selectedFilter !== 'Default' ? selectedFilter : null,
      }),
  });

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

  // Function to handle adding a new product
  const handleAddProduct = newProduct => {
    // This would typically call an API to add the product
    console.log('Adding new product:', newProduct);
    // In a real implementation, we would update the state or refetch products
    setAddProductModalOpen(false);
  };

  const openDetails = useCallback(product => {
    // Map the product to the details format expected by the sheet
    const productDetails: ProductDetails = {
      id: String(product.id),
      name: product.name,
      supplier: product.brand,
      images: [
        { src: product.image, alt: product.name },
        // Additional gallery examples
        { src: '/images/products/pleated-table-lamp.png', alt: 'Alt angle' },
        { src: '/images/products/travertine-table-lamp.png', alt: 'Detail' },
      ],
      prices: { retail: product.price, trade: undefined },
      productType: product.category,
      colour: product.tags?.[0],
      material: undefined,
      size: undefined,
      sku: undefined,
      stockStatus: product.inStock ? 'In Stock' : 'Confirm Stock',
      sampleAvailable: 'No',
      measurements: undefined,
      description: "High-quality design piece curated for modern interiors. Materials and finish align with the studio's earthy palette.",
      tags: product.tags,
      url: undefined,
    };
    setSelected(product);
    setSheetOpen(true);
  }, []);

  // Use the fetched data or fall back to mock data if not available
  // const products = data?.products || [];

  useEffect(() => {
    if (!isLoading) setProducts(data?.products);
  }, [data, isLoading]);

  const handleOpenTypeModal = project => {
    setTypes(project);
    setModalOpen(true);
  };

  function closeModal() {
    setModalOpen(false);
    setTypes([]);
    setSelectedType(null);
    setQty(1);
  }

  const handleAddToProject = (id: string) => {
    toast.warning('No Room ! Please Add Room');
  };

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

  const handleSelectProduct = product => {
    setSelectedProduct(product);
    setEditModal(true);
  };

  // useEffect(() => {
  //   console.log(products.find((product) => product?.type));
  // }, [products]);

  // useEffect(() => {
  //   console.log(selectedProduct);
  // }, [selectedProduct]);

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <LibraryNav />

        {/* Header - Single Line Layout */}
        <div className="mb-4 flex items-center justify-between gap-4">
          {/* Left side - Category filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-1 flex gap-1">
            {['All', 'Furniture', 'Lighting', 'Fabric', 'Accessories'].map(category => (
              <Button
                key={category}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={` font-medium px-3 ${
                  selectedCategory == category
                    ? 'bg-gray-900 hover:bg-gray-900 hover:text-white text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
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
                onChange={e => setSearchQuery(e.target.value)}
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
              <Button className="h-9 gap-2" onClick={() => setAddProductModalOpen(true)}>
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
                  <div key={index} className="h-64 rounded-md bg-gray-200 animate-pulse"></div>
                ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500">Error loading products. Please try again later.</div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">No products found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map(product => (
                <Card key={product.id} className="group flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg">
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
                        {product?.images?.length > 0 ? (
                          <img
                            src={!isLoading && product?.images?.[product.images.length - 1]}
                            alt={product?.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          product?.imageURL?.length > 0 && (
                            <img
                              src={product?.imageURL[0]}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          )
                        )}
                      </div>
                    </button>

                    {/* Overlay Actions */}
                    <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button size="sm" variant="secondary" className="h-8 w-8 bg-white/90 p-0 hover:bg-white">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 bg-white/90 p-0 hover:bg-white"
                            aria-label={`Open actions for`}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetails(product)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSelectProduct(product)}>Edit Product</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {/* <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 bg-white/90 p-0 hover:bg-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button> */}
                    </div>

                    {/* Stock Status */}
                    {/* {!product.inStock && (
                      <div className="absolute left-3 top-3">
                        <StatusBadge status="Out of Stock" />
                      </div>
                    )} */}
                  </div>

                  <CardContent className="p-4 flex-1 ">
                    <div className="space-y-2.5 flex flex-col justify-between h-full w-full ">
                      <div>
                        <div>
                          {/* Clickable title also opens details */}
                          <button
                            type="button"
                            onClick={() => openDetails(product)}
                            className="text-left"
                            aria-label={`Open ${product.name} details`}
                          >
                            <h3 className="truncate text-sm !capitalize font-semibold tracking-tight text-gray-900">{product.name}</h3>
                            <p className="text-xs capitalize tracking-wide text-gray-500">{product.supplier}</p>
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex  items-center justify-between">
                          <span className="tabular-nums text-sm font-semibold text-gray-900">
                            £{Number(product?.priceRegular).toLocaleString()}
                          </span>
                          {product?.type && <TypeChip label={product.type} />}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="w-full">
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 w-full bg-transparent opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                            >
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add to project Drawer */}

          <Dialog open={modalOpen} onOpenChange={open => (!open ? closeModal() : null)}>
            <DialogContent className="sm:max-w-[500px] flex flex-col py-6">
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
        </div>
      </div>

      {/* Product Detail Sheet */}
      <ProductDetailSheet open={sheetOpen} onOpenChange={setSheetOpen} product={selected} />

      <EditProductModal productInfo={selectedProduct} closeEditModal={closeEditModal} editModal={editModal} />

      {/* Add Product Modal - You would need to create this component */}
      <AddProductModal closeModal={() => setAddProductModalOpen(false)} modalOpen={addProductmodalOpen} />
    </div>
  );
}
