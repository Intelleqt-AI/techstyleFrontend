import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '../chip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
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
    case 'approved':
      return 'bg-[#F2FCE2] text-[#4B9E22]';
    case 'pending':
      return 'bg-[#FEF7CD] text-[#946800]';
    case 'rejected':
      return 'bg-[#FFCCCB] text-[#9E2000]';
    default:
      return 'bg-gray-100 text-gray-700';
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
  //   const navigate = useNavigate();
  const [clientApprove, setClientApprove] = useState(false);

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

  const handleChangeStatus = (item, status, roomID) => {
    const { matchedProduct, ...updatedProduct } = { ...item, initialStatus: status };
    mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
  };

  const handleChangeSample = (item, status, roomID) => {
    const { matchedProduct, ...updatedProduct } = { ...item, sample: status };
    mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
  };

  const debouncedHandleQtyChange = debounce((item, value, roomID) => {
    handleQtyChange(item, value, roomID);
  }, 700);

  const handleQtyChange = (item, qty, roomID) => {
    if (qty < 1 || Number.isNaN(qty)) {
      toast('Enter valid Qty');
      return;
    }
    const { matchedProduct, ...updatedProduct } = { ...item, qty: qty };
    mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
  };

  const handleDueDateChange = (item, date, roomID) => {
    if (!date) {
      const { matchedProduct, ...updatedProduct } = { ...item, delivery: '' };
      mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
      return;
    }

    const parsedDate = dayjs(date).format('YYYY-MM-DD');
    const { matchedProduct, ...updatedProduct } = { ...item, delivery: parsedDate };
    mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
  };

  const handleInstallDateChange = (item, date, roomID) => {
    if (!date) {
      const { matchedProduct, ...updatedProduct } = { ...item, install: '' };
      mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
      return;
    }

    const parsedDate = dayjs(date).format('YYYY-MM-DD');
    const { matchedProduct, ...updatedProduct } = { ...item, install: parsedDate };
    mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
  };

  const handleLeadDate = (item, date, roomID) => {
    if (!date) {
      const { matchedProduct, ...updatedProduct } = { ...item, leadTime: '' };
      mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
      return;
    }

    // const parseDate = dayjs(date).format('YYYY-MM-DD');
    const { matchedProduct, ...updatedProduct } = { ...item, leadTime: date };
    mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
  };

  return (
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
                  {/* <input type="checkbox" className="rounded border-greige-500/30" aria-label="Select all items" /> */}
                  <Checkbox onCheckedChange={checked => handleCheckAll({ target: { checked } })} />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Item</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 w-[120px]">Dimensions</th>
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

              {groupedItems?.type?.map((item, index) => (
                <>
                  {item?.product?.length > 0 && (
                    <TableRow key={item.text}>
                      <TableCell colSpan={5} className="font-medium capitalize   sticky left-0 bg-white  z-10  text-[16px] ">
                        {item.text}
                        <span className="text-[12px] ml-1 bg-gray-100 font-medium px-2 py-1 rounded-2xl">
                          {item?.product?.length} items
                        </span>
                      </TableCell>
                    </TableRow>
                  )}

                  {(clientApprove ? item?.product?.filter(item => item.status === 'approved') : item.product)?.map((item, index) => {
                    return (
                      <tr key={item.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <Checkbox
                            key={item?.id}
                            value={item.id}
                            checked={!!checkedItems.find(checkItem => checkItem.id == item.id && checkItem.roomID == item.id)}
                            onCheckedChange={checked => handleChange({ target: { value: item, checked, room: item.id } })}
                          />
                        </td>

                        {/* Item cell with thumbnail button to open sheet */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <button
                              type="button"
                              // onClick={() => openProduct(item.id)}
                              className="shrink-0 focus:outline-none focus:ring-2 focus:ring-clay-600 rounded-lg"
                              aria-label={`View ${item.name}`}
                              title={`View ${item.name}`}
                            >
                              {item?.matchedProduct?.imageURL?.length > 0 ? (
                                <img
                                  src={item.matchedProduct.imageURL[0]}
                                  alt={item?.matchedProduct?.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img src={item?.matchedProduct?.images[0]} alt={item?.name} className="w-full h-full object-cover" />
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

                        <td
                          className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate w-[120px]"
                          title={item?.matchedProduct?.dimensions}
                        >
                          {item?.matchedProduct?.dimensions}
                        </td>

                        <td className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate">
                          {item?.PO?.map(po => {
                            return (
                              <Link className="hover:underline" href={`/finances/purchase-orders/${po?.poID}`}>
                                {po?.poNumber} <br />{' '}
                              </Link>
                            );
                          })}
                        </td>
                        <td className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate">
                          <Select value={item?.sample} onValueChange={value => handleChangeSample(item, value, item.id)}>
                            <SelectTrigger className="">
                              <SelectValue placeholder={item?.sample || 'Select'} />
                            </SelectTrigger>
                            <SelectContent className="">
                              <SelectItem value={'None'}>None</SelectItem>
                              <SelectItem value={'Requested'}>Requested</SelectItem>
                              <SelectItem value={'Received'}>Received</SelectItem>
                              <SelectItem value={'Submitted'}>Submitted</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>

                        <td className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate" title={item.date}>
                          {item.date}
                        </td>
                        <td className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate">{item.leadTime}</td>
                        <td className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate">
                          <Input
                            className="max-w-8 h-auto w-auto px-[6px] py-0 bg-transparent border placeholder:opacity-100 placeholder:text-black"
                            type="text"
                            defaultValue={item.qty}
                            placeholder={item.qty}
                            onBlur={e => debouncedHandleQtyChange(item, e.target.value, item.id)}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-neutral-900 tabular-nums whitespace-nowrap truncate" title={item.price}>
                          <p>
                            <span className="text-xs w-10 inline-block text-gray-500">Retail: </span>
                            <span className=" ">
                              {project?.currency?.symbol ? project?.currency?.symbol : '£'}
                              {(item?.matchedProduct?.priceRegular
                                ? Number(item?.qty) > 0
                                  ? parseFloat(item?.matchedProduct?.priceRegular.replace(/[^\d.]/g, '')) * Number(item?.qty)
                                  : parseFloat(item?.matchedProduct?.priceRegular.replace(/[^\d.]/g, ''))
                                : 0
                              ).toLocaleString()}
                            </span>
                          </p>
                          <p>
                            <span className="text-xs w-10 inline-block text-gray-500">Trade: </span>
                            <span className=" ">
                              {project?.currency?.symbol ? project?.currency?.symbol : '£'}

                              {(item?.matchedProduct?.priceMember
                                ? Number(item?.qty) > 0
                                  ? parseFloat(item?.matchedProduct?.priceMember.replace(/[^\d.]/g, '')) * Number(item?.qty)
                                  : parseFloat(item?.matchedProduct?.priceMember.replace(/[^\d.]/g, ''))
                                : 0
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
                              {/* <DropdownMenuItem onClick={() => openProduct(item.id)}>View details</DropdownMenuItem> */}
                              <DropdownMenuItem>Update status</DropdownMenuItem>
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
    </Card>
  );
};

export default ProcurementTable;
