import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '../chip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ExternalLink, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateProductProcurement } from '@/supabase/API';
import { debounce } from 'lodash';
import { Checkbox } from '../ui/checkbox';
import { TableCell, TableRow } from '../ui/table';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import errorImage from '/public/product-placeholder-wp.jpg';
import Image from 'next/image';
import ProductImage from './ProductImage';
import { format } from 'date-fns';
import { ProductDetailSheet } from '../product-detail-sheet';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import dayjs from 'dayjs';

const procurementItems: ProcurementItem[] = [
  {
    id: 1,
    name: 'Italian Leather Sofa',
    image: '/images/products/leather-ottoman.png',
    dimensions: '220 x 95 x 85cm',
    date: '2025-08-20',
    leadTime: '8-10 weeks',
    quantity: 1,
    price: '£3,200.00',
    status: 'ordered',
    supplier: 'West Elm',
    poNumber: 'PO-24051',
    sample: 'Requested',
    clientApproval: 'approved',
  },
  {
    id: 2,
    name: 'Marble Coffee Table',
    image: '/images/products/arched-mirror.png',
    dimensions: '120 x 60 x 45cm',
    date: '2025-08-22',
    leadTime: '6-8 weeks',
    quantity: 1,
    price: '£1,850.00',
    status: 'pending',
    supplier: 'John Lewis',
    poNumber: 'PO-24052',
    sample: 'Yes',
    clientApproval: 'pending',
  },
  {
    id: 3,
    name: 'Designer Floor Lamp',
    image: '/images/products/pleated-table-lamp.png',
    dimensions: '30 x 30 x 165cm',
    date: '2025-08-24',
    leadTime: '4-6 weeks',
    quantity: 2,
    price: '£450.00',
    status: 'delivered',
    supplier: 'Habitat',
    poNumber: 'PO-24053',
    sample: 'Yes',
    clientApproval: 'approved',
  },
  {
    id: 4,
    name: 'Velvet Dining Chairs',
    image: '/images/products/striped-armchair.png',
    dimensions: '55 x 60 x 85cm',
    date: '2025-08-26',
    leadTime: '3-4 weeks',
    quantity: 6,
    price: '£280.00',
    status: 'ordered',
    supplier: 'Made.com',
    poNumber: 'PO-24054',
    sample: 'No',
    clientApproval: 'pending',
  },
  {
    id: 5,
    name: 'Persian Area Rug',
    image: '/images/products/woven-dining-chair.png',
    dimensions: '300 x 200cm',
    date: '2025-08-28',
    leadTime: '2-3 weeks',
    quantity: 1,
    price: '£1,200.00',
    status: 'pending',
    supplier: 'The Rug Company',
    poNumber: 'PO-24055',
    sample: 'Requested',
    clientApproval: 'rejected',
  },
  {
    id: 6,
    name: 'Crystal Chandelier',
    image: '/images/products/travertine-table-lamp.png',
    dimensions: '80 x 80 x 100cm',
    date: '2025-09-02',
    leadTime: '12-14 weeks',
    quantity: 1,
    price: '£2,800.00',
    status: 'ordered',
    supplier: 'Harrods',
    poNumber: 'PO-24056',
    sample: 'Yes',
    clientApproval: 'approved',
  },
  {
    id: 7,
    name: 'Oak Dining Table',
    image: '/images/products/studded-dresser.png',
    dimensions: '200 x 100 x 75cm',
    date: '2025-09-05',
    leadTime: '10-12 weeks',
    quantity: 1,
    price: '£1,650.00',
    status: 'delivered',
    supplier: "Heal's",
    poNumber: 'PO-24057',
    sample: 'Yes',
    clientApproval: 'approved',
  },
  {
    id: 8,
    name: 'Brass Wall Sconces',
    image: '/images/products/fringed-parasol.png',
    dimensions: '15 x 25 x 30cm',
    date: '2025-09-08',
    leadTime: '6-8 weeks',
    quantity: 4,
    price: '£180.00',
    status: 'pending',
    supplier: 'Lights.co.uk',
    poNumber: 'PO-24058',
    sample: 'No',
    clientApproval: 'pending',
  },
];

function ApprovalBadge({ status }) {
  const label = status === 'approved' ? 'Approved' : status === 'pending' ? 'Pending' : 'Rejected';
  return <StatusBadge status={status} label={label} />;
}

const getStatusColor = status => {
  switch (status) {
    case 'Received':
      return 'bg-[#F2FCE2] text-[#4B9E22] border border-[#C6E6A4]';
    case 'Requested':
      return 'bg-[#FEF7CD] text-[#946800] border border-[#E6D999]';
    case 'Submitted':
      return 'bg-gray-100 text-gray-700 border border-gray-300';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-300';
  }
};

const ProcurementTable = ({
  showProject = false,
  setCheckedItems,
  checkedItems,
  groupedItems,
  handleDelete,
  project,
  handleChangeRoom,
  refetch,
  loading,
  projectID,
}) => {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(undefined);
  const [selected, setSelected] = useState(undefined);
  const [roomID, setRoomID] = useState(null);
  //   const navigate = useNavigate();
  const [clientApprove, setClientApprove] = useState(false);

  function editProduct(item, roomID) {
    setEditItem(item);
    setRoomID(roomID);
    setEditOpen(true);
  }

  function openProduct(item) {
    setSelected(item ?? undefined);
    setOpen(true);
  }

  const handleCheckAll = e => {
    const allProducts = [];

    if (groupedItems?.type && Array.isArray(groupedItems.type)) {
      groupedItems.type.forEach(typeObj => {
        if (typeObj && Array.isArray(typeObj.product)) {
          // Add roomID to each product
          const productsWithRoomID = typeObj.product.map(product => ({
            ...product,
            roomID: typeObj.id,
          }));

          allProducts.push(...productsWithRoomID);
        }
      });
    }

    setCheckedItems(e.target.checked ? allProducts : []);
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => (prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]));
  };

  const handleDeleteItem = (itemID, roomID) => {
    handleDelete(itemID, roomID);
  };

  const changeRoom = (roomID, productID) => {
    handleChangeRoom(roomID, productID);
  };

  const handleClientApprove = e => {
    const { checked } = e.target;
    if (checked) {
      setClientApprove(true);
    } else {
      setClientApprove(false);
    }
  };

  const handleChange = e => {
    const { value, checked, room } = e.target;
    setCheckedItems(prev => {
      if (checked) {
        return [...prev, { ...value, roomID: room }];
      } else {
        return prev.filter(item => item.id !== value.id && roomID == room);
      }
    });
  };

  // Update Product
  const mutation = useMutation({
    mutationFn: updateProductProcurement,
    onSuccess: () => {
      toast('Status Updated');
      queryClient.refetchQueries('GetAllProduct');
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  // handle Change product Status
  const statusValues = [
    'Draft',
    'Hidden',
    'Selected',
    'Quoting',
    'Internal Review',
    'Client Review',
    'Resubmit',
    'Closed',
    'Rejected',
    'Approved',
    'Ordered',
    'Payment Due',
    'In Production',
    'In Transit',
    'Installed',
    'Delivered',
  ];

  const handleChangeStatus = (item, status) => {
    const { matchedProduct, ...updatedProduct } = { ...item, initialStatus: status };
    setEditItem(prev => ({
      ...prev,
      initialStatus: status,
    }));
    mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
  };

  const handleChangeSample = (item, status) => {
    const { matchedProduct, ...updatedProduct } = { ...item, sample: status };
    setEditItem(prev => ({
      ...prev,
      sample: status,
    }));
    mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
  };

  const debouncedHandleQtyChange = debounce((item, value) => {
    handleQtyChange(item, value, roomID);
  }, 700);

  const handleQtyChange = (item, qty) => {
    if (qty < 1 || Number.isNaN(qty)) {
      toast('Enter valid Qty');
      return;
    }
    const { matchedProduct, ...updatedProduct } = { ...item, qty: qty };
    mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
  };

  const handleDueDateChange = (item, date) => {
    if (!date) {
      const { matchedProduct, ...updatedProduct } = { ...item, delivery: '' };
      mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
      return;
    }

    const parsedDate = dayjs(date).format('YYYY-MM-DD');
    setEditItem(prev => ({
      ...prev,
      delivery: parsedDate,
    }));

    const { matchedProduct, ...updatedProduct } = { ...item, delivery: parsedDate };
    mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
  };

  const handleInstallDateChange = (item, date) => {
    if (!date) {
      const { matchedProduct, ...updatedProduct } = { ...item, install: '' };
      mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
      return;
    }

    const parsedDate = dayjs(date).format('YYYY-MM-DD');

    setEditItem(prev => ({
      ...prev,
      install: parsedDate,
    }));

    const { matchedProduct, ...updatedProduct } = { ...item, install: parsedDate };
    mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
  };

  const handleLeadDate = (item, date) => {
    if (!date) {
      const { matchedProduct, ...updatedProduct } = { ...item, leadTime: '' };
      mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
      return;
    }

    setEditItem(prev => ({
      ...prev,
      leadTime: date,
    }));

    // const parseDate = dayjs(date).format('YYYY-MM-DD');
    const { matchedProduct, ...updatedProduct } = { ...item, leadTime: date };
    mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
  };

  return (
    <Card className="border border-greige-500/30 shadow-sm overflow-hidden rounded-xl">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col style={{ width: 50 }} />
              <col style={{ width: 180 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 100 }} /> {/* PO # */}
              <col style={{ width: 112 }} /> {/* Sample */}
              <col style={{ width: 110 }} /> {/* Order Date */}
              <col style={{ width: 110 }} /> {/* Lead Time */}
              <col style={{ width: 60 }} /> {/* Qty */}
              <col style={{ width: 110 }} /> {/* Price */}
              <col style={{ width: 152 }} /> {/* Status */}
              <col style={{ width: 90 }} /> {/* Approval */}
              <col style={{ width: 100 }} /> {/* Actions */}
            </colgroup>
            <thead className="bg-neutral-50 border-b border-greige-500/30 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 w-10">
                  {/* <input type="checkbox" className="rounded border-greige-500/30" aria-label="Select all items" /> */}
                  <Checkbox onCheckedChange={checked => handleCheckAll({ target: { checked } })} />
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
              {loading &&
                [1, 2, 3, 4, 5, 6, 7].map(item => {
                  return (
                    <TableRow>
                      {/* Checkbox */}
                      <TableCell>
                        <Skeleton className="w-5 h-5 bg-gray-200 rounded border" />
                      </TableCell>

                      {/* Product image and info */}
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Skeleton className="w-12 bg-gray-200 h-12 rounded" />
                          <div className="space-y-1">
                            <Skeleton className="w-28 bg-gray-200 h-4" />
                            <Skeleton className="w-20 bg-gray-200 h-3" />
                          </div>
                        </div>
                      </TableCell>

                      {/* Dimensions */}
                      <TableCell>
                        <Skeleton className="w-28 bg-gray-200 h-4" />
                      </TableCell>

                      {/* Delivery & Install Dates */}
                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="w-2 bg-gray-2004 h-3" />
                          <Skeleton className="w-24 bg-gray-200 h-3" />
                        </div>
                      </TableCell>

                      {/* Quantity */}
                      <TableCell>
                        <Skeleton className="w-12 bg-gray-200 h-6" />
                      </TableCell>

                      {/* N/A */}
                      <TableCell>
                        <Skeleton className="w-10 bg-gray-200 h-4" />
                      </TableCell>

                      {/* Total */}
                      <TableCell>
                        <Skeleton className="w-20 bg-gray-200 h-4" />
                      </TableCell>

                      {/* Location dropdown */}
                      <TableCell>
                        <Skeleton className="w-24 bg-gray-200 h-6 rounded" />
                      </TableCell>
                    </TableRow>
                  );
                })}

              {groupedItems?.type?.map((items, index) => (
                <>
                  {items?.product?.length > 0 && (
                    <tr key={items.text}>
                      <TableCell colSpan={5} className="font-medium capitalize pl-16   sticky left-0 bg-white  z-10  text-[16px] ">
                        {items.text}
                        <span className="text-[12px] ml-1 bg-gray-100 font-medium px-2 py-1 rounded-2xl">
                          {items?.product?.length} items
                        </span>
                      </TableCell>
                    </tr>
                  )}

                  {(clientApprove ? items?.product?.filter(item => item.status === 'approved') : items.product)?.map((item, index) => {
                    return (
                      <tr key={item.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <Checkbox
                            key={item?.id}
                            value={item.id}
                            checked={!!checkedItems.find(checkItem => checkItem.id == item.id && checkItem.roomID == items.id)}
                            onCheckedChange={checked => handleChange({ target: { value: item, checked, room: items.id } })}
                          />
                        </td>

                        {/* Item cell with thumbnail button to open sheet */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={() => openProduct(item.matchedProduct)}
                              className="shrink-0 focus:outline-none focus:ring-2 focus:ring-clay-600 rounded-lg"
                              aria-label={`View ${item.name}`}
                              title={`View ${item.name}`}
                            >
                              {item?.matchedProduct?.imageURL?.length > 0 ? (
                                <ProductImage
                                  className="w-10 h-10 rounded-lg object-cover border border-greige-500/30 bg-white"
                                  alt={item?.matchedProduct?.name || 'Product image'}
                                  src={item?.matchedProduct?.imageURL?.[0]}
                                />
                              ) : item?.matchedProduct?.images.length > 0 ? (
                                <ProductImage
                                  className="w-10 h-10 rounded-lg object-cover border border-greige-500/30 bg-white"
                                  alt={item?.name}
                                  src={item?.matchedProduct?.images[0]}
                                />
                              ) : (
                                <ProductImage
                                  className="w-10 h-10 rounded-lg object-cover border border-greige-500/30 bg-white"
                                  alt={item?.name}
                                  src={errorImage.src}
                                />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-neutral-900 whitespace-nowrap truncate" title={item?.matchedProduct?.name}>
                                {item?.matchedProduct?.name}
                              </div>
                              <div className="text-xs text-neutral-600 whitespace-nowrap truncate" title={item?.matchedProduct?.supplier}>
                                {item?.matchedProduct?.supplier}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-neutral-700 w-32 whitespace-nowrap truncate" title={item?.matchedProduct?.dimensions}>
                          {item?.matchedProduct?.dimensions}
                        </td>
                        <td className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate">
                          {item?.PO?.map(po => {
                            return (
                              <Link className="hover:underline" href={'#'}>
                                {po?.poNumber} <br />{' '}
                              </Link>
                            );
                          })}
                          {!item?.PO && 'None'}
                        </td>
                        <td className={`px-4 py-3 text-neutral-700 whitespace-nowrap truncate `} title={item.sample}>
                          <span
                            className={`${getStatusColor(
                              item?.sample
                            )} inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium leading-none select-none" `}
                          >
                            {' '}
                            {item?.sample || 'None'}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate" title={item?.delivery}>
                          {item?.delivery ? format(new Date(item?.delivery), 'MMM dd, yyyy') : 'None'}
                        </td>
                        <td className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate">
                          {item?.leadTime ? item.leadTime + ' Weeks' : 'None'}
                        </td>
                        <td className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate">{item?.qty}</td>
                        <td className="px-4 py-3 font-medium text-neutral-900 tabular-nums whitespace-nowrap truncate" title={item?.price}>
                          <p>
                            <span className=" ">
                              {project?.currency?.symbol ? project?.currency?.symbol : '£'}

                              {(item?.matchedProduct?.priceMember
                                ? parseFloat(item?.matchedProduct?.priceMember.replace(/[^\d.]/g, ''))
                                : parseFloat(item?.matchedProduct?.priceRegular.replace(/[^\d.]/g, ''))
                              ).toLocaleString()}
                            </span>
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            status={item.initialStatus}
                            label={item.initialStatus.charAt(0).toUpperCase() + item.initialStatus.slice(1)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <ApprovalBadge status={item?.status} />
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
                              <DropdownMenuItem onClick={() => openProduct(item.matchedProduct)}>View details</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => editProduct(item, items.id)}>Update status</DropdownMenuItem>
                              <DropdownMenuItem>Download PO</DropdownMenuItem>
                              <DropdownMenuItem>Contact supplier</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      {/* Product detail sheet */}
      <ProductDetailSheet open={open} onOpenChange={setOpen} product={selected} />

      {/* Edit Product Modal */}

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-xl md:max-w-3xl">
          <div className="flex h-full flex-col">
            <SheetHeader className="px-6 pt-6">
              <SheetTitle className="text-xl font-semibold text-neutral-900">{editItem?.matchedProduct?.name}</SheetTitle>
              {editItem?.matchedProduct?.supplier ? (
                <div className="text-sm text-neutral-600">Supplier: {editItem?.matchedProduct?.supplier}</div>
              ) : null}
            </SheetHeader>

            <Separator className="mt-4" />

            <div className="flex-1 overflow-y-auto">
              <div className="grid gap-6 p-6 grid-cols-2">
                {/* Right: details */}

                {/* Delivery date */}
                <div className={cn('rounded-lg border border-greige-500/30 bg-neutral-50 p-4')}>
                  <div className="text-xs font-medium text-neutral-500">{'Delivery Date'}</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            'justify-start h-auto gap-1  text-xs  w-full text-left !py-1 px-2 pl-1',
                            !editItem?.delivery && 'text-[#595F69]'
                          )}
                        >
                          {editItem?.delivery ? format(new Date(editItem?.delivery), 'MMM dd, yyyy') : <span>Select Date</span>}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto pt-3 shadow-2xl bg-white">
                        <Calendar
                          mode="single"
                          selected={editItem?.delivery ? new Date(editItem?.delivery) : undefined}
                          onSelect={date => {
                            handleDueDateChange(editItem, date);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Install date */}
                <div className={cn('rounded-lg border border-greige-500/30 bg-neutral-50 p-4')}>
                  <div className="text-xs font-medium text-neutral-500">{'Install Date'}</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            'justify-start h-auto gap-1  text-xs  w-full text-left !py-1 px-2 pl-1',
                            !editItem?.install && 'text-[#595F69]'
                          )}
                        >
                          {editItem?.install ? format(new Date(editItem?.install), 'MMM dd, yyyy') : <span>Select Date</span>}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto pt-3 shadow-2xl bg-white">
                        <Calendar
                          mode="single"
                          selected={editItem?.install ? new Date(editItem?.install) : undefined}
                          onSelect={date => {
                            handleInstallDateChange(editItem, date);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Lead Time */}
                <div className={cn('rounded-lg border border-greige-500/30 bg-neutral-50 p-4')}>
                  <div className="text-xs font-medium text-neutral-500">{'Lead Time'}</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            'justify-start h-auto gap-1  text-xs rounded-xl w-full text-left !py-1 px-2 pl-1',
                            !editItem?.leadTime && 'text-[#595F69]'
                          )}
                        >
                          {editItem?.leadTime ? editItem.leadTime + ' Weeks' : <span>Select Time</span>}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto pt-3 shadow-xl bg-white">
                        <div className="week-input-container">
                          <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Lead Time (weeks)</div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Input
                              type="number"
                              placeholder="From"
                              min="1"
                              style={{
                                width: '80px',
                                padding: '8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '14px',
                              }}
                              onChange={e => {
                                const fromWeek = parseInt(e.target.value);
                                const toWeek = parseInt(e.target.nextElementSibling.value);
                                if (fromWeek && toWeek) {
                                  handleLeadDate(editItem, `${fromWeek}-${toWeek}`);
                                }
                              }}
                              autoFocus
                            />
                            <Input
                              type="number"
                              placeholder="To"
                              min="1"
                              style={{
                                width: '80px',
                                padding: '8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '14px',
                              }}
                              onChange={e => {
                                const toWeek = parseInt(e.target.value);
                                const fromWeek = parseInt(e.target.previousElementSibling.value);
                                if (fromWeek && toWeek) {
                                  handleLeadDate(editItem, `${fromWeek}-${toWeek}`);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Quantity */}
                <div className={cn('rounded-lg border border-greige-500/30 bg-neutral-50 p-4')}>
                  <div className="text-xs font-medium text-neutral-500">{'Quantity'}</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">
                    <Input
                      className=" w-full h-auto  px-[6px] py-0 bg-transparent border placeholder:opacity-100 placeholder:text-black"
                      type="number"
                      defaultValue={editItem?.qty}
                      placeholder={editItem?.qty}
                      onBlur={e => debouncedHandleQtyChange(editItem, e.target.value)}
                    />
                  </div>
                </div>

                {/* Sample */}
                <div className={cn('rounded-lg border border-greige-500/30 bg-neutral-50 p-4')}>
                  <div className="text-xs font-medium text-neutral-500">{'Sample'}</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">
                    <Select value={editItem?.sample} onValueChange={value => handleChangeSample(editItem, value)}>
                      <SelectTrigger className="bg-transparent w-full text-left focus:ring-0 focus:ring-offset-0 pl-0 text-xs py-1 font-medium  border-0 focus:border-0 focus-visible:outline-0">
                        <SelectValue className="text-sm" placeholder={editItem?.sample || 'Select'} />
                      </SelectTrigger>
                      <SelectContent className="bg-white  z-[99]">
                        <SelectItem value={'None'}>None</SelectItem>
                        <SelectItem value={'Requested'}>Requested</SelectItem>
                        <SelectItem value={'Received'}>Received</SelectItem>
                        <SelectItem value={'Submitted'}>Submitted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Initial Status */}

                <div className={cn('rounded-lg border border-greige-500/30 bg-neutral-50 p-4')}>
                  <div className="text-xs font-medium text-neutral-500">{'Status'}</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">
                    <Select value={editItem?.initialStatus} onValueChange={value => handleChangeStatus(editItem, value)}>
                      <SelectTrigger className="bg-transparent  text-left focus:ring-0 focus:ring-offset-0 pl-0 text-xs py-1 font-medium w-full border-0 focus:border-0 focus-visible:outline-0">
                        <SelectValue placeholder={editItem?.initialStatus || 'Select'} />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[99] h-[320px]">
                        <div className="overflow-y-auto h-full">
                          {statusValues.map(item => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky footer actions */}
            <div className="border-t border-greige-500/30 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-neutral-600">Update product for this room</div>
                <div className="flex gap-2">
                  {editItem?.matchedProduct?.product_url ? (
                    <a
                      href={editItem?.matchedProduct?.product_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-md border border-greige-500/30 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      View Product
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
};

export default ProcurementTable;
