import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '../chip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronRight, ChevronsUpDown, ExternalLink, Loader2, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createInvoice,
  createPurchaseOrder,
  createXeroInvoice,
  createXeroPO,
  getContactbyID,
  getPurchaseOrder,
  updateInvoice,
  updateProductProcurement,
  updateProductStatusToInternalReview,
  updatePurchaseOrder,
} from '@/supabase/API';
import { debounce } from 'lodash';
import { Checkbox } from '../ui/checkbox';
import { TableCell, TableRow } from '../ui/table';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import errorImage from '/public/product-placeholder-wp.jpg';
import Image from 'next/image';
import ProductImage from './ProductImage';
import { format } from 'date-fns';
import { ProductDetailSheet } from '../product-detail-sheet';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Separator } from '../ui/separator';
import { addDays, cn, formatDateObj, parseMoney } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import dayjs from 'dayjs';
import { DeleteDialog } from '../DeleteDialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import useSupplier from '@/hooks/useSupplier';
import LogisticsPill from './LogisticsPill';
import POCell from './POCell';
import BillingCell from './BillingCell';

function StatusPill({ value, onChange }) {
  const labels = {
    Draft: 'Draft',
    Quoting: 'Quoting',
    'Internal Review': 'Internal Review',
    'Out of Stock': 'Out of Stock',
    'Client Review': 'Client Review',
    'Payment Due': 'Payment Due',
    Ordered: 'Ordered',
    'In Transit': 'In Transit',
    Delivered: 'Delivered',
    Installed: 'Installed',
  };

  const colors = {
    Draft: 'bg-gray-200/50 text-gray-700 border-gray-400/40',
    Quoting: 'bg-sage-200/40 text-olive-700 border-olive-300',
    'Internal Review': 'bg-ochre-200/30 text-ochre-700 border-ochre-500/20',
    'Out of Stock': 'bg-terracotta-600/10 text-terracotta-600 border-terracotta-600/30',
    'Client Review': 'bg-greige-100 text-taupe-700 border-greige-500',
    'Payment Due': 'bg-amber-200/40 text-amber-700 border-amber-700/20',
    Ordered: 'bg-blue-200/40 text-blue-700 border-blue-700/20',
    'In Transit': 'bg-purple-200/40 text-purple-700 border-purple-700/20',
    Delivered: 'bg-green-200/40 text-green-700 border-green-700/20',
    Installed: 'bg-emerald-200/40 text-emerald-700 border-emerald-700/20',
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn('h-6  text-xs font-medium border whitespace-nowrap w-auto ', colors[value])}>
        <SelectValue>{labels[value]}</SelectValue>
      </SelectTrigger>

      <SelectContent>
        {Object.keys(labels).map(key => (
          <SelectItem key={key} value={key}>
            {labels[key]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SamplePill({ status, onChange }) {
  // Default to "None" if status is null, undefined, or empty string
  const currentStatus = status ?? 'None';

  const labels = {
    None: 'Not required',
    Requested: 'Requested',
    Received: 'Received',
    Submitted: 'Sent',
  };

  const colors = {
    None: 'bg-greige-100 text-taupe-700 border-greige-500',
    Requested: 'bg-ochre-300/30 text-ochre-700 border-ochre-700/30',
    Submitted: 'bg-slatex-500/10 text-slatex-700 border-slatex-500/20',
    Received: 'bg-sage-300/50 text-olive-700 border-olive-700/20',
  };

  if (onChange) {
    return (
      <Select value={currentStatus} onValueChange={onChange}>
        <SelectTrigger className={cn('h-6 text-xs font-medium border whitespace-nowrap w-auto', colors[currentStatus])}>
          <SelectValue>{labels[currentStatus]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="None">Not required</SelectItem>
          <SelectItem value="Requested">Requested</SelectItem>
          <SelectItem value="Submitted">Sent</SelectItem>
          <SelectItem value="Received">Received</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <span
      className={cn('inline-flex items-center rounded-md border h-6 px-2 text-xs font-medium whitespace-nowrap', colors[currentStatus])}
    >
      {labels[currentStatus]}
    </span>
  );
}

function ApprovalPill({ status, onChange }) {
  const labels = { 'not-needed': 'Not needed', pending: 'Pending', approved: 'Approved', rejected: 'Changes requested' };
  const colors = {
    'not-needed': 'bg-greige-100 text-taupe-700 border-greige-500',
    pending: 'bg-ochre-300/30 text-ochre-700 border-ochre-700/30',
    approved: 'bg-sage-300/50 text-olive-700 border-olive-700/20',
    rejected: 'bg-terracotta-600/10 text-terracotta-600 border-terracotta-600/30',
  };

  if (onChange) {
    return (
      <Select value={status} onValueChange={onChange}>
        <SelectTrigger className={cn('h-6 text-xs font-medium border whitespace-nowrap w-auto', colors[status])}>
          <SelectValue>{labels[status]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="not-needed">Not needed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Changes requested</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <span className={cn('inline-flex items-center rounded-md border h-6 px-2 text-xs font-medium whitespace-nowrap', colors[status])}>
      {labels[status]}
    </span>
  );
}

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
  const { data: supplier, isLoading: supplierLoading } = useSupplier();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(undefined);
  const [selected, setSelected] = useState(undefined);
  const [roomID, setRoomID] = useState(null);
  const [clientApprove, setClientApprove] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<null | { id: string; roomId: string; name: string }>(null);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [loadingProductIdForInv, setLoadingProductIdForInv] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['pruchaseOrder'],
    queryFn: getPurchaseOrder,
  });

  const { data: contact, isLoading: clientLoading } = useQuery({
    queryKey: ['contact', project?.client],
    queryFn: () => getContactbyID(project?.client),
    enabled: !!project?.client,
  });

  const mutationInvoice = useMutation({
    mutationFn: updateInvoice,
    onSuccess: () => {},
    onError: () => {
      toast('Error! Try again');
    },
  });

  // Update Product in room
  const mutation = useMutation({
    mutationFn: updateProductProcurement,
    onSuccess: () => {
      toast('Status Updated');
      queryClient.refetchQueries('GetAllProduct');
      setLoadingProductIdForInv(null);
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  // update PO
  const mutationPO = useMutation({
    mutationFn: updatePurchaseOrder,
    onSuccess: () => {
      refetch();
      setLoadingProductId(null);
    },
    onError: () => {
      setLoadingProductId(null);
      toast('Error! Try again');
    },
  });

  const { mutate: createPOMutate } = useMutation({
    mutationFn: createXeroPO,
    onSuccess(data, variables, context) {
      toast.success(data?.message);
      // Extract original invoice you want to update (inv)
      const inv = variables?._originalPo;
      // Only run second mutation if ID exists
      if (data?.bill_id) {
        mutationPO.mutate({
          order: {
            ...inv,
            xero_po_id: data.bill_id,
          },
        });

        const { matchedProduct, ...updatedProduct } = {
          ...currentProduct,
          xeroPoNumber: data.bill_id,
          initialStatus: 'Internal Review',
        };
        mutation.mutate({ product: updatedProduct, projectID: projectID, roomID });
      }
    },
  });

  const createPurchase = useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: async e => {
      try {
        if (!e?.data?.[0]) {
          toast.error('Failed to get PO details from response.');
          return;
        }

        const inv = e?.data?.[0];
        const lineItems = inv.products.map(p => ({
          description: p.itemName,
          quantity: p.QTY,
          unit_amount: parseMoney(p.amount),
          account_code: '200',
        }));
        const issueDate = inv.issueDate.split('T')[0];
        const dueAfter30 = addDays(issueDate, 30);

        const invoicePayload = {
          type: 'ACCPAY',
          contact: inv.supplier.company,
          date: formatDateObj(issueDate),
          due_date: formatDateObj(dueAfter30),
          invoice_number: inv.poNumber,
          reference: inv.poNumber || '',
          currency_code: project?.currency?.code,
          status: 'AUTHORISED',
          line_items: lineItems,
          _originalPo: inv,
        };

        createPOMutate(invoicePayload);
        // After all mutations are done
      } catch (err) {
        toast.error(err.message || 'An error occurred during product updates.');
        setLoadingProductId(null);
      }
    },
    onError: e => {
      toast.error(e.message || 'Failed to create purchase order.');
      setLoadingProductId(null);
    },
  });

  const handleClickPO = (product, room) => {
    setRoomID(room);
    setCurrentProduct(product);
    setLoadingProductId(product?.id);
    const totalOrder = {
      supplier: supplier.data.find(items => items.company.trim() === product.matchedProduct.supplier.trim()),
      projectID: projectID,
      projectName: project?.name,
      status: 'Pending',
      clientName: contact ? contact.name + ' ' + contact.surname : null,
      clientEmail: contact ? contact.email : null,
      clientPhone: contact ? contact.phone : null,
      clientAddress: contact ? contact.address : null,
      issueDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      products: [],
    };
    const products = [
      {
        dueDate: product?.install,
        amount:
          product?.matchedProduct?.priceMember && parseFloat(product?.matchedProduct.priceMember?.replace(/[^0-9.-]+/g, '')) > 0
            ? product.matchedProduct?.priceMember
            : product.matchedProduct.priceRegular,
        QTY: product.qty,
        itemName: product.matchedProduct.name,
        itemID: product.matchedProduct.id,
        dimensions: product?.matchedProduct?.dimensions,
        imageURL:
          product?.matchedProduct?.imageURL?.length > 0
            ? product?.matchedProduct?.imageURL[0]
            : product?.matchedProduct?.images?.length > 0 && product?.matchedProduct?.images[0],
      },
    ];
    totalOrder.products = [...products];
    createPurchase.mutate({ order: totalOrder });
  };

  useEffect(() => {
    if (!project) return;
    const rooms = project?.type?.map(item => item.text) || [];
    setExpandedRooms(new Set(rooms));
  }, [project]);

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
        return prev.filter(item => !(item.id === value.id && item.roomID === room));
      }
    });
  };

  // handle Change product Status
  const statusValues = [
    'Draft',
    'Quoting',
    'Internal Review',
    'Out of Stock',
    'Client Review',
    'Payment Due',
    'Ordered',
    'In Transit',
    'Delivered',
    'Installed',
  ];

  const handleChangeStatus = (item, status, roomid) => {
    const currentRoomID = roomid || roomID;
    const { matchedProduct, ...updatedProduct } = { ...item, status: status };
    setEditItem(prev => ({
      ...prev,
      status: status,
    }));
    mutation.mutate({ product: updatedProduct, projectID: projectID, roomID: currentRoomID });
  };

  const handleChangeInitialStatus = (item, status, roomid) => {
    const currentRoomID = roomid || roomID;
    const { matchedProduct, ...updatedProduct } = { ...item, initialStatus: status };
    setEditItem(prev => ({
      ...prev,
      initialStatus: status,
    }));
    mutation.mutate({ product: updatedProduct, projectID: projectID, roomID: currentRoomID });
  };

  const handleChangeUnitType = (item, status, roomid) => {
    const currentRoomID = roomid || roomID;
    const { matchedProduct, ...updatedProduct } = { ...item, unitType: status };
    setEditItem(prev => ({
      ...prev,
      unitType: status,
    }));
    mutation.mutate({ product: updatedProduct, projectID: projectID, roomID: currentRoomID });
  };

  const handleAddPo = (item, po) => {
    const updatedPO = [...(item?.PO || []), { poID: po.poID, poNumber: po.poNumber }];
    const { matchedProduct, ...updatedProduct } = { ...item, PO: updatedPO };
    mutation.mutate({ product: updatedProduct, projectID, roomID });
  };

  const handleChangeSample = (item, status, roomid) => {
    const currentRoomID = roomid || roomID;
    const { matchedProduct, ...updatedProduct } = { ...item, sample: status };
    setEditItem(prev => ({
      ...prev,
      sample: status,
    }));
    mutation.mutate({ product: updatedProduct, projectID: projectID, roomID: currentRoomID });
  };

  const debouncedHandleQtyChange = debounce((item, value, roomid) => {
    const currentRoomID = roomid || roomID;
    handleQtyChange(item, value, currentRoomID);
  }, 700);

  const handleQtyChange = (item, qty, roomid) => {
    if (qty < 1 || Number.isNaN(qty)) {
      toast('Enter valid Qty');
      return;
    }
    const { matchedProduct, ...updatedProduct } = { ...item, qty: qty };
    mutation.mutate({ product: updatedProduct, projectID: projectID, roomID: roomid });
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

  const toggleRoom = (room: string) => {
    setExpandedRooms(prev => {
      const next = new Set(prev);
      if (next.has(room)) next.delete(room);
      else next.add(room);
      return next;
    });
  };

  // Total price of a room
  function getTotalPrice(room) {
    if (!room?.product?.length) return '0.00';

    const total = room.product.reduce((sum, item) => {
      const mp = item.matchedProduct || {};
      let priceStr = mp.priceMember && mp.priceMember !== '0' && mp.priceMember.trim() !== '' ? mp.priceMember : mp.priceRegular;

      if (!priceStr) return sum;
      const price = parseFloat(priceStr.replace(/[R\s,]/g, '')) || 0;
      const qty = item.qty && Number(item.qty) > 0 ? Number(item.qty) : 1;
      return sum + price * qty;
    }, 0);

    // Format result
    return total.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const handleChangeLogistics = (updatedProduct, roomID, done) => {
    mutation.mutate(
      { product: updatedProduct, projectID, roomID },
      {
        onSettled: () => {
          if (done) done();
        },
      }
    );
  };

  const {
    mutate: createInvoiceMutate,
    data: createdInvoice,
    isPending,
  } = useMutation({
    mutationFn: createXeroInvoice,
    onSuccess(data, variables, context) {
      toast.success(data?.message);
      // Extract original invoice you want to update (inv)
      const inv = variables?._originalInvoice;
      // Only run second mutation if ID exists
      if (data?.invoice_id) {
        mutationInvoice.mutate({
          invoice: {
            ...inv,
            xero_invoice_id: data.invoice_id,
          },
        });
      }

      // xeroPoNumber match with other product
      groupedItems?.type(items => {
        items?.map(item => {
          if (item.xeroPoNumber == inv.xeroPoNumber) {
            const { matchedProduct, ...updatedProduct } = {
              ...item,
              xeroInvNumber: data.invoice_id,
            };
            mutation.mutate({ product: updatedProduct, projectID: projectID, roomID: items?.id });
          }
          return;
        });
      });
    },
  });

  const createInvoiceOrder = useMutation({
    mutationFn: createInvoice,
    onSuccess: (data, variables, context) => {
      if (data?.data[0]) {
        const inv = data?.data[0];
        console.log(data?.data[0]);
        const lineItems = inv.products.map(p => ({
          description: p.itemName,
          quantity: p.QTY,
          unit_amount: parseMoney(p.amount),
          account_code: '200',
        }));
        const issueDate = inv.issueDate.split('T')[0];
        const dueAfter30 = addDays(issueDate, 30);

        const invoicePayload = {
          type: 'ACCREC',
          contact: inv.clientName,
          date: formatDateObj(issueDate),
          due_date: formatDateObj(dueAfter30),
          invoice_number: inv.inNumber,
          reference: inv.inNumber,
          currency_code: project?.currency?.code,
          status: 'AUTHORISED',
          line_items: lineItems,

          // attach original invoice here
          _originalInvoice: inv,
        };

        createInvoiceMutate(invoicePayload);
      }
    },
    onError: e => {
      toast.error(e.message);
    },
  });

  const handleInvoice = inv => {
    createInvoiceOrder.mutate({
      invoice: {
        projectID: projectID,
        status: 'Pending',
        clientName: inv?.clientName,
        clientEmail: inv?.clientEmail,
        clientPhone: inv?.clientPhone,
        clientAddress: inv?.clientAddress,
        delivery_charge: inv?.delivery_charge,
        poNumber: inv?.poNumber,
        products: inv?.products,
        synced: false,
      },
    });
  };

  const clickHandleInvoice = (item, room, po) => {
    setLoadingProductIdForInv(item?.id);
    setRoomID(room);
    setCurrentProduct(item);
    handleInvoice(po);
  };

  return (
    <Card className="border border-greige-500/30 shadow-sm overflow-hidden rounded-xl">
      <CardContent className="p-0">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
          <table className="w-full min-w-[1600px]">
            <thead className="bg-neutral-50 border-b border-greige-500/30">
              <tr>
                <th className=" left-0 sticky  z-10 bg-neutral-50 px-4 py-3 w-12">
                  <Checkbox onCheckedChange={checked => handleCheckAll({ target: { checked } })} />
                </th>
                <th className=" z-10 sticky left-10 bg-neutral-50 px-4 py-3 text-left text-xs font-medium text-neutral-700 min-w-[280px]">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 min-w-[140px]">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 min-w-[100px]">Sample</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 min-w-[120px]">Qty / Unit</th>
                <th className="px-4 py-3 text-right text-xs  font-medium text-neutral-700  min-w-[80px]">
                  Unit {project?.currency?.symbol || '£'}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 min-w-[110px]">
                  Total {project?.currency?.symbol || '£'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 min-w-[60px]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 min-w-[60px]">Approval</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 min-w-[110px]">PO</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 min-w-[140px]">Billing</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 min-w-[120px]">Logistics</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 w-12"></th>
                <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {loading &&
                [1, 2, 3, 4, 5, 6, 7].map(item => (
                  <TableRow key={item}>
                    <TableCell>
                      <Skeleton className="w-5 h-5 bg-gray-200 rounded border" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 bg-gray-200 h-12 rounded" />
                        <div className="space-y-1">
                          <Skeleton className="w-28 bg-gray-200 h-4" />
                          <Skeleton className="w-20 bg-gray-200 h-3" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-28 bg-gray-200 h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-12 bg-gray-200 h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-10 bg-gray-200 h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-20 bg-gray-200 h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-24 bg-gray-200 h-6 rounded" />
                    </TableCell>
                  </TableRow>
                ))}
              {groupedItems?.type?.map(items => {
                const subtotalCount = items?.product?.length || 0;
                if (!subtotalCount) return null;

                const isExpanded = expandedRooms?.has(items.text);
                const allSelected = items.product.every(item =>
                  checkedItems.find(check => check.id === item.id && check.roomID === items.id)
                );
                const totalPrice = getTotalPrice(items);

                return (
                  <>
                    <tr key={items.text} className=" border-greige-500/30 last:border-b-0">
                      {/* Group header */}
                      <TableCell colSpan={5} className="font-medium capitalize  sticky left-0 bg-white  z-10  text-[16px] ">
                        <div className="bg-neutral-30  border-greige-500/30">
                          <button
                            onClick={() => toggleRoom(items.text)}
                            className="w-full flex items-center gap-3 px-4 py-1 text-left  transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-neutral-600 shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0" />
                            )}
                            <span className="font-semibold capitalize text-neutral-900">
                              {items.text} — {subtotalCount} items • Subtotal {project?.currency?.symbol}
                              {totalPrice}
                            </span>
                          </button>
                        </div>
                      </TableCell>
                    </tr>

                    {/* Table body per group */}
                    {isExpanded &&
                      (clientApprove ? items?.product?.filter(i => i.status === 'approved') : items.product)?.map(item => {
                        const isChecked = !!checkedItems.find(check => check.id === item.id && check.roomID === items.id);

                        return (
                          <tr key={item.id} className={cn('hover:bg-neutral-50 transition-colors group', isChecked && 'bg-primary/5')}>
                            {/* Checkbox */}
                            <td className="sticky left-0 z-10 bg-white group-hover:bg-neutral-50 px-4 py-3">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={checked => handleChange({ target: { value: item, checked, room: items.id } })}
                              />
                            </td>

                            {/* Product */}
                            <td className="sticky left-12 z-10 bg-white group-hover:bg-neutral-50 px-4 py-3">
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  onClick={() => openProduct(item.matchedProduct)}
                                  className="shrink-0 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                                >
                                  <ProductImage
                                    className="w-12 h-12 rounded-lg object-cover border border-greige-500/30 bg-white"
                                    alt={item?.matchedProduct?.name || 'Product image'}
                                    src={item?.matchedProduct?.imageURL?.[0] || item?.matchedProduct?.images?.[0] || errorImage.src}
                                  />
                                </button>
                                <div className="flex-1 min-w-0 pt-0.5">
                                  <button
                                    onClick={() => openProduct(item.matchedProduct)}
                                    className="font-semibold text-sm text-neutral-900 hover:text-primary block truncate max-w-[180px]"
                                    title={item?.matchedProduct?.name}
                                  >
                                    {item?.matchedProduct?.name}
                                  </button>
                                  <div className="text-xs text-neutral-600 mt-1 truncate">{item?.matchedProduct?.dimensions}</div>
                                </div>
                              </div>
                            </td>

                            {/* Dimensions */}
                            <td className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate">{item?.matchedProduct?.supplier}</td>

                            {/* PO */}
                            <td className="px-4 py-3 text-xs text-neutral-700 whitespace-nowrap truncate">
                              <SamplePill status={item?.sample} onChange={status => handleChangeSample(item, status, items?.id)} />
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Input
                                  onChange={e => debouncedHandleQtyChange(item, e.target.value, items?.id)}
                                  type="number"
                                  defaultValue={item.qty || 1}
                                  className="h-9 w-16 text-sm px-2 tabular-nums"
                                />
                                <Select
                                  defaultValue={item.unitType || 'ea'}
                                  onValueChange={status => handleChangeUnitType(item, status, items?.id)}
                                >
                                  <SelectTrigger className="h-9 w-16 text-sm px-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ea">ea</SelectItem>
                                    <SelectItem value="m">m</SelectItem>
                                    <SelectItem value="m²">m²</SelectItem>
                                    <SelectItem value="set">set</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </td>

                            {/* Order Date */}
                            <td className="px-4 py-3 text-right text-neutral-700 whitespace-nowrap truncate">
                              {project?.currency?.symbol || '£'}
                              {(() => {
                                const memberPrice = parseFloat(item?.matchedProduct?.priceMember?.replace(/[^\d.]/g, '') || '0');
                                const regularPrice = parseFloat(item?.matchedProduct?.priceRegular?.replace(/[^\d.]/g, '') || '0');
                                const priceToUse = memberPrice > 0 ? memberPrice : regularPrice;
                                return priceToUse.toLocaleString('en-GB', { minimumFractionDigits: 2 });
                              })()}
                            </td>

                            {/* Lead Time */}
                            <td className="px-4 font-semibold py-3 text-right text-neutral-700 whitespace-nowrap truncate">
                              {project?.currency?.symbol || '£'}
                              {(() => {
                                const memberPrice = parseFloat(item?.matchedProduct?.priceMember?.replace(/[^\d.]/g, '') || '0');
                                const regularPrice = parseFloat(item?.matchedProduct?.priceRegular?.replace(/[^\d.]/g, '') || '0');
                                const priceToUse = (memberPrice > 0 ? memberPrice : regularPrice) * (item?.qty || 1);
                                return priceToUse.toLocaleString('en-GB', { minimumFractionDigits: 2 });
                              })()}
                            </td>

                            {/* Qty */}
                            <td className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate">
                              <StatusPill
                                value={item?.initialStatus}
                                onChange={value => handleChangeInitialStatus(item, value, items?.id)}
                              />
                            </td>
                            <td className="px-4 py-3 text-neutral-700 whitespace-nowrap truncate">
                              <ApprovalPill status={item?.status} onChange={status => handleChangeStatus(item, status, items?.id)} />
                            </td>

                            {/* Price */}
                            <td className="px-4 py-3 text-right font-medium text-neutral-900 tabular-nums whitespace-nowrap truncate">
                              <POCell room={items?.id} item={item} handleClickPO={handleClickPO} loadingProductId={loadingProductId} />
                            </td>
                            <td className="px-4 py-3">
                              <BillingCell
                                clickHandleInvoice={clickHandleInvoice}
                                loadingProductIdForInv={loadingProductIdForInv}
                                item={item}
                                room={items?.id}
                                allPOs={data?.data}
                              />
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3">
                              <LogisticsPill item={item} room={items} handleChangeLogistics={handleChangeLogistics} />
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openProduct(item.matchedProduct)}>View details</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => editProduct(item, items.id)}>Update status</DropdownMenuItem>
                                  <DropdownMenuItem>Download PO</DropdownMenuItem>
                                  <DropdownMenuItem>Contact supplier</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setDeleteTarget({
                                        id: item.id,
                                        roomId: items.id,
                                        name: item?.matchedProduct?.name,
                                      });
                                      setIsDeleteOpen(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                  </>
                );
              })}
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
                      onChange={e => debouncedHandleQtyChange(editItem, e.target.value)}
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

                {/* PO */}
                {/* <div className={cn('rounded-lg border border-greige-500/30 bg-neutral-50 p-4')}>
                        <div className="text-xs font-medium text-neutral-500">{'PO'}</div>
                        <div className="mt-1 text-sm font-semibold text-neutral-900">
                          <Select onValueChange={value => handleAddPo(editItem, value)}>
                            <SelectTrigger className="bg-transparent  text-left focus:ring-0 focus:ring-offset-0 pl-0 text-xs py-1 font-medium w-full border-0 focus:border-0 focus-visible:outline-0">
                              <SelectValue placeholder={'Select PO'} />
                            </SelectTrigger>
                            <SelectContent className="bg-white z-[99] h-[320px]">
                              <div className="overflow-y-auto h-full">
                                {data?.data?.map(item => (
                                  <SelectItem key={item} value={item}>
                                    {item?.poNumber}
                                  </SelectItem>
                                ))}
                              </div>
                            </SelectContent>
                          </Select>
                        </div>
                      </div> */}
                <div className={cn('rounded-lg border border-greige-500/30 bg-neutral-50 p-4')}>
                  <div className="text-xs font-medium text-neutral-500">{'PO'}</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">
                    {(() => {
                      const [open, setOpen] = useState(false);
                      const [selectedPO, setSelectedPO] = useState(null);

                      return (
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              role="combobox"
                              aria-expanded={open}
                              className="w-full justify-between bg-transparent text-left text-xs font-medium p-0 h-auto"
                            >
                              {selectedPO ? selectedPO.poNumber : 'Select PO'}
                              <ChevronsUpDown className="ml-2 h-3 w-3 opacity-50" />
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent
                            className="w-[280px] p-0 bg-white z-[99] max-h-[320px] overflow-hidden"
                            side="bottom"
                            align="start"
                            onWheel={e => e.stopPropagation()} // 🧠 this is key
                          >
                            <Command>
                              <CommandInput placeholder="Search PO..." className="text-sm" />
                              <CommandList className="max-h-[280px] overflow-y-auto">
                                <CommandEmpty>No PO found.</CommandEmpty>
                                <CommandGroup>
                                  {data?.data?.map(po => (
                                    <CommandItem
                                      key={po.poID}
                                      value={po.poNumber}
                                      onSelect={() => {
                                        setSelectedPO(po);
                                        setOpen(false);
                                        handleAddPo(editItem, po);
                                      }}
                                    >
                                      {po.poNumber}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      );
                    })()}
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

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false), setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) {
            handleDelete(deleteTarget.id, deleteTarget.roomId);
          }
          setDeleteTarget(null);
        }}
        title="Remove Product"
        description="Are you sure you want to remove this product ? This action cannot be undone."
        itemName={deleteTarget?.name}
        requireConfirmation={false}
      />
    </Card>
  );
};

export default ProcurementTable;
