'use client';

import { ProjectNav } from '@/components/project-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/chip';
import { FileText, ShoppingCart, Plus, RefreshCw, Search, Filter, MoreHorizontal, CircleCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import {
  addNewChat,
  createXeroInvoice,
  createXeroPO,
  deleteInvoices,
  deletePurchaseOrder,
  fetchInvoices,
  fetchOnlyProject,
  getInvoices,
  getPurchaseOrder,
  updateInvoice,
  updatePurchaseOrder,
} from '@/supabase/API';
import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createInvoice } from '@/supabase/API';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { DeleteDialog } from '@/components/DeleteDialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useClient from '@/hooks/useClient';
import { addDays, formatDateObj, parseMoney } from '@/lib/utils';
import PoStatus from '@/app/finance/invoices/InvoiceStatus copy';
import InvoiceStatus from '@/app/finance/invoices/InvoiceStatus';

const gbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

function parseGBP(amount: string): number {
  return Number(amount.replace(/[^0-9.]/g, ''));
}

export default function ProjectFinancePage({ params }: { params: { id: string } }) {
  const [purchaseOrder, setPurchaseOrder] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [buttonLoadingPO, setButtonLoadingPO] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);
  const [isPo, setIsPo] = useState(null);
  const [openSendInvoice, setOpenSendInvoice] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const pathname = usePathname();
  const [myXeroInvoice, setMyXeroInvoice] = useState([]);
  const { data: clientData, isLoading: clientLoading } = useClient();
  const id = params.id;

  const {
    data: xeroInvoices,
    isLoading: XeroLoading,
    isError,
    error,
    refetch: fetchInvoice,
  } = useQuery({
    queryKey: ['xeroInvoices'],
    queryFn: fetchInvoices,
  });

  const deletePO = useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => {
      toast.success('PO Deleted');
      handleRefetch();
    },
    onError: error => {
      toast.error(error);
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: deleteInvoices,
    onSuccess: () => {
      toast.success('Invoice Deleted');
      handleRefetch();
    },
    onError: error => {
      toast.error(error);
    },
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pruchaseOrder'],
    queryFn: getPurchaseOrder,
  });

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: [`project ${id}`],
    queryFn: () => fetchOnlyProject({ projectID: id }),
    enabled: !!id,
  });

  // update PO
  const mutation = useMutation({
    mutationFn: updatePurchaseOrder,
    onSuccess: () => {
      refetch();
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  useEffect(() => {
    if (clientLoading || projectLoading || XeroLoading) return;
    const client = clientData?.data?.find(c => c.id === project?.client);
    if (!client) return;

    // filter invoices by client.name or client.surname
    const filteredInvoices = xeroInvoices?.filter(inv => {
      const contactName = inv.Contact?.Name?.toLowerCase() || '';
      return contactName.includes(client.name?.toLowerCase() || '') || contactName.includes(client.surname?.toLowerCase() || '');
    });

    setMyXeroInvoice(filteredInvoices);
  }, [clientData, project, xeroInvoices, clientLoading, projectLoading, XeroLoading]);

  const {
    data: InvoiceData,
    isLoading: InvoiceLoading,
    refetch: InvoiceRefetch,
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  });

  const { mutate: createPOMutate } = useMutation({
    mutationFn: createXeroPO,
    onSuccess(data, variables, context) {
      toast.success(data?.message);
      // Extract original invoice you want to update (inv)
      const inv = variables?._originalPo;
      // Only run second mutation if ID exists
      if (data?.bill_id) {
        mutation.mutate({
          order: {
            ...inv,
            xero_po_id: data.bill_id,
          },
        });
      }
    },
  });

  const mutationInv = useMutation({
    mutationFn: updateInvoice,
    onSuccess: () => {
      InvoiceRefetch();
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

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
        mutationInv.mutate({
          invoice: {
            ...inv,
            xero_invoice_id: data.invoice_id,
          },
        });
      }
    },
  });

  // Create Xero PO / Bill
  const handleCreatePo = inv => {
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
      contact: inv.clientName,
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
  };

  // Create Thread
  const threadMutation = useMutation({
    mutationFn: addNewChat,
    onError: () => {
      toast.error('Error! Try again');
    },
    onSuccess: () => {
      toast.success('Sent as threads');
      setTitle('');
      setDescription('');
      setOpenSendInvoice(false);
      setCurrentInvoice(null);
    },
  });

  const handleSendToClient = invoice => {
    setCurrentInvoice(invoice);
    setOpenSendInvoice(true);
  };

  const handleSubmit = () => {
    threadMutation.mutate({
      topic: `Invoice : ${title}`,
      description: description,
      projectID: id,
      invoices: [currentInvoice?.id],
    });
    // call your API or Supabase function here
  };

  useEffect(() => {
    if (isLoading) return;
    setPurchaseOrder(data?.data.filter(item => item.projectID == id));
  }, [isLoading, data?.data, id]);

  useEffect(() => {
    if (InvoiceLoading) return;
    setInvoices(InvoiceData?.data.filter(item => item.projectID == id));
  }, [InvoiceLoading, InvoiceData?.data, id]);

  const handleRefetch = () => {
    refetch();
    InvoiceRefetch();
  };

  const handleSync = () => {
    setCustomLoading(true);
    setTimeout(() => {
      handleRefetch();
      setCustomLoading(false);
    }, 2000);
  };

  const createPurchase = useMutation({
    mutationFn: createInvoice,
    onSuccess: e => {
      setTimeout(() => {
        setCheckedItems([]);
        toast.success('Invoice Created!');
        setButtonLoadingPO(false);
        InvoiceRefetch();
        // navigate(`/finances/invoice/${id}`, {
        //   state: {
        //     purchaseOrders: checkedItems,
        //     printMultiple: true,
        //   },
        // })
        // router.push(`/finances/invoice/${id}?printMultiple=true&purchaseOrders=${encodeURIComponent(JSON.stringify(checkedItems))}`);
      }, 1000);
    },
    onError: e => {
      toast.error(e.message);
      setButtonLoadingPO(false);
    },
  });

  // Check all PO
  const handleCheckAll = e => {
    let allProducts = [];
    if (purchaseOrder && Array.isArray(purchaseOrder)) {
      allProducts = [...purchaseOrder];
    }
    setCheckedItems(e.target.checked ? allProducts : []);
  };

  // Handle single PO
  const handleChange = e => {
    const { value, checked } = e.target;
    setCheckedItems(prev => {
      if (checked) {
        return [...prev, value];
      } else {
        return prev.filter(item => item.id !== value.id);
      }
    });
  };

  // Handle Create Invoice
  const handleInvoice = () => {
    setButtonLoadingPO(true);
    createPurchase.mutate({
      invoice: {
        projectID: id,
        status: 'Pending',
        clientName: purchaseOrder[0]?.clientName,
        clientEmail: purchaseOrder[0]?.clientEmail,
        clientPhone: purchaseOrder[0]?.clientPhone,
        clientAddress: purchaseOrder[0]?.clientAddress,
        delivery_charge: checkedItems.reduce((acc, sum) => acc + sum?.delivery_charge, 0),
        poNumber: checkedItems.map(item => item.poNumber),
        products: checkedItems.flatMap(item => item.products),
      },
    });
  };

  // Calculate totals for stats
  let totalPurchaseOrder = 0;
  let totalInvoiceOrder = 0;

  invoices.forEach(item => {
    const temp =
      item?.products?.reduce((total, product) => {
        const amount = parseFloat(product?.amount?.replace(/[^0-9.-]+/g, ''));
        return total + amount * product.QTY;
      }, 0) || 0;

    totalInvoiceOrder += temp;
  });

  purchaseOrder.forEach(item => {
    const temp =
      item?.products?.reduce((total, product) => {
        const amount = parseFloat(product?.amount ? product?.amount?.replace(/[^0-9.-]+/g, '') : 0);
        return total + amount * (product.QTY && product.QTY > 0 ? product.QTY : 1);
      }, 0) || 0;

    totalPurchaseOrder += temp;
  });

  const viewInvoicePDF = async invoiceId => {
    try {
      const accessToken = localStorage.getItem('xero_access_token');
      const tenantId = localStorage.getItem('xero_tenant_id');

      if (!accessToken || !tenantId) {
        alert('Missing authentication tokens');
        return;
      }

      const url = `https://xero-backend-pi.vercel.app/api/get-invoice-pdf?invoiceId=${invoiceId}`;

      const response = await fetch(url, {
        method: 'GET', // Explicitly set method
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'xero-tenant-id': tenantId,
          Accept: 'application/pdf',
        },
      });

      if (!response.ok) {
        // Try to get error details
        const contentType = response.headers.get('content-type');
        let errorDetail;

        if (contentType && contentType.includes('application/json')) {
          errorDetail = await response.json();
          console.error('JSON Error:', errorDetail);
        } else {
          errorDetail = await response.text();
          console.error('Text Error:', errorDetail);
        }

        alert(`Failed to get PDF: ${response.status} - ${JSON.stringify(errorDetail)}`);
        return;
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        alert('Received empty PDF file');
        return;
      }

      const fileURL = URL.createObjectURL(blob);
      const newWindow = window.open(fileURL);

      if (!newWindow) {
        alert('Popup blocked. Please allow popups for this site.');
        // Fallback: create download link
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = `invoice-${invoiceId}.pdf`;
        link.click();
      }

      // Clean up the object URL after some time
      setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
    } catch (error) {
      console.error('PDF view error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const xeroTotal = useMemo(() => {
    let totalInvoiceOrder = 0;
    myXeroInvoice?.forEach(item => {
      const temp = item?.Total || 0;
      totalInvoiceOrder += temp;
    });
    return totalInvoiceOrder;
  }, [myXeroInvoice]);

  // Create Xero Invoice
  const handleCreate = inv => {
    const lineItems = inv?.products?.map(p => ({
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
      reference: inv?.poNumber,
      currency_code: project?.currency?.code,
      status: 'AUTHORISED',
      line_items: lineItems,

      // attach original invoice here
      _originalInvoice: inv,
    };

    createInvoiceMutate(invoicePayload);
  };

  const financeStats = [
    {
      title: 'Total Invoices',
      value: project?.currency?.symbol
        ? project.currency.symbol +
          (totalInvoiceOrder + xeroTotal).toLocaleString('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          })
        : gbp.format(totalInvoiceOrder + xeroTotal),
      subtitle: `${(invoices?.length ?? 0) + (myXeroInvoice?.length ?? 0)} ${
        (invoices?.length ?? 0) + (myXeroInvoice?.length ?? 0) === 1 ? 'Invoice' : 'Invoices'
      }${myXeroInvoice?.length ? ` (${myXeroInvoice.length} from Xero)` : ''}`,

      icon: FileText,
    },
    {
      title: 'Total Purchase Orders',
      value: project?.currency?.symbol
        ? project.currency.symbol +
          totalPurchaseOrder.toLocaleString('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          })
        : gbp.format(totalPurchaseOrder),
      subtitle: `${purchaseOrder?.length} ${purchaseOrder?.length === 1 ? 'Purchase Order' : 'Purchase Orders'}`,
      icon: ShoppingCart,
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-[#A8E2EC] text-[#2C96A8]';
      case 'pending':
        return 'bg-orange-100 text-orange-900';
      case 'sent':
        return 'bg-[#DAEAFD] text-[#3556BB]';
      case 'received':
        return 'bg-[#C5E7D9] text-green-900';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const openDeleteModal = (po, tag) => {
    setIsDeleteOpen(true);
    setSelectedPo(po);
    if (tag == 'po') {
      setIsPo(true);
    } else {
      setIsPo(false);
    }
  };

  const handleDelete = id => {
    if (isPo) {
      deletePO.mutate({ orderID: id });
    } else {
      deleteInvoice.mutate({ id });
    }
  };

  const handleOpenPO = id => {
    window.open(`/finance/purchase-order/pdf/${id}`, '_blank', 'noopener,noreferrer');
    mutation.mutate({ order: { id, isDownloaded: true } });
  };

  const handleOpenInvoice = id => {
    window.open(`/finance/invoices/pdf/${id}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectNav projectId={params.id} />

        {/* Finance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {financeStats.map(stat => (
            <Card key={stat.title} className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <stat.icon className="w-4 h-4 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions Bar — match Finance baseline */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search invoices and POs..." className="pl-10 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* <Button
              className="bg-gray-900 text-white hover:bg-gray-800"
              onClick={handleInvoice}
              disabled={checkedItems.length === 0 || buttonLoadingPO}
            >
              <Plus className="w-4 h-4 mr-2" />
              {buttonLoadingPO ? 'Creating...' : 'Create Invoice'}
            </Button>
            <Button variant="outline" onClick={handleSync} disabled={InvoiceLoading || isLoading || customLoading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {customLoading ? 'Syncing...' : 'Sync with Xero'}
            </Button> */}
          </div>
        </div>

        {/* Finance Table */}
        <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <colgroup>
                  <col style={{ width: '44px' }} />
                  <col style={{ width: '160px' }} />
                  <col style={{ width: '132px' }} />
                  <col style={{ width: '132px' }} />
                  <col style={{ width: '140px' }} />
                  <col style={{ width: '140px' }} />
                  <col style={{ width: '120px' }} />
                  <col style={{ width: '120px' }} />
                  <col style={{ width: '64px' }} />
                </colgroup>
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      <Checkbox onCheckedChange={checked => handleCheckAll({ target: { checked } })} aria-label="Select all" />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap">PO/IN Number</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Supplier</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap">Date Issued</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap">Due Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Sync</th>
                    <th className="px-2 pr-4 py-3 text-right text-sm font-medium text-gray-600 w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {(isLoading || InvoiceLoading || customLoading) &&
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="w-5 h-5 bg-gray-200 rounded border animate-pulse"></div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                        </td>
                        <td className="px-2 pr-4 py-3 text-right">
                          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse ml-auto"></div>
                        </td>
                      </tr>
                    ))}

                  <>
                    {!customLoading &&
                      purchaseOrder.map(po => (
                        <tr key={po.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={!!checkedItems.find(checkItem => checkItem.id == po.id)}
                              onCheckedChange={checked => handleChange({ target: { value: po, checked } })}
                              aria-label={`Select ${po.poNumber}`}
                            />
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                            <Link className="hover:underline flex items-center gap-2" href={`${pathname}/purchase-order/${po.id}`}>
                              <span> {po.poNumber}</span>
                              {po?.isDownloaded && <CircleCheck size={15} color="green" />}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{po?.supplier?.company || '-'}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">Purchase Order</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {po.issueDate
                              ? new Date(po.issueDate).toLocaleDateString('en-GB')
                              : new Date(po.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {po?.dueDate ? new Date(po.dueDate).toLocaleDateString('en-GB') : '-'}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                            {project?.currency?.symbol ? project?.currency?.symbol : '£'}
                            {(
                              po?.products?.reduce((total, product) => {
                                return (
                                  total +
                                  parseFloat(product?.amount ? product?.amount?.replace(/[^0-9.-]+/g, '') : 0) *
                                    (product.QTY && product.QTY > 0 ? product.QTY : 1)
                                );
                              }, 0) || 0
                            ).toLocaleString('en-GB', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <PoStatus po={po} />
                          </td>
                          <td className="px-4 text-center py-3">
                            {po?.xero_po_id ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                className="logo-xero-blue mx-auto"
                                viewBox="0 0 45 46"
                                id="xero"
                              >
                                <path
                                  fill="#13B5EA"
                                  d="M22.457 45.49c12.402 0 22.456-10.072 22.456-22.495C44.913 10.57 34.86.5 22.457.5 10.054.5 0 10.57 0 22.995 0 35.418 10.054 45.49 22.457 45.49"
                                  className="logo-xero-blue__circle"
                                ></path>
                                <path
                                  fill="#fff"
                                  d="M10.75 22.935l3.832-3.85a.688.688 0 0 0-.977-.965l-3.83 3.833-3.845-3.84a.687.687 0 0 0-.966.979l3.832 3.837-3.83 3.84a.688.688 0 1 0 .964.981l3.84-3.842 3.825 3.827a.685.685 0 0 0 1.184-.473.68.68 0 0 0-.2-.485l-3.83-3.846m22.782.003c0 .69.56 1.25 1.25 1.25a1.25 1.25 0 0 0-.001-2.5c-.687 0-1.246.56-1.246 1.25m-2.368 0c0-1.995 1.62-3.62 3.614-3.62 1.99 0 3.613 1.625 3.613 3.62s-1.622 3.62-3.613 3.62a3.62 3.62 0 0 1-3.614-3.62m-1.422 0c0 2.78 2.26 5.044 5.036 5.044s5.036-2.262 5.036-5.043c0-2.78-2.26-5.044-5.036-5.044a5.046 5.046 0 0 0-5.036 5.044m-.357-4.958h-.21c-.635 0-1.247.2-1.758.595a.696.696 0 0 0-.674-.54.68.68 0 0 0-.68.684l.002 8.495a.687.687 0 0 0 1.372-.002v-5.224c0-1.74.16-2.444 1.648-2.63.14-.017.288-.014.29-.014.406-.015.696-.296.696-.675a.69.69 0 0 0-.69-.688m-13.182 4.127c0-.02.002-.04.003-.058a3.637 3.637 0 0 1 7.065.055H16.2zm8.473-.13c-.296-1.403-1.063-2.556-2.23-3.296a5.064 5.064 0 0 0-5.61.15 5.098 5.098 0 0 0-1.973 5.357 5.08 5.08 0 0 0 4.274 3.767c.608.074 1.2.04 1.81-.12a4.965 4.965 0 0 0 1.506-.644c.487-.313.894-.727 1.29-1.222.006-.01.014-.017.022-.027.274-.34.223-.826-.077-1.056-.254-.195-.68-.274-1.014.156-.072.104-.153.21-.24.315-.267.295-.598.58-.994.802-.506.27-1.08.423-1.69.427-1.998-.023-3.066-1.42-3.447-2.416a3.716 3.716 0 0 1-.153-.58l-.01-.105h7.17c.982-.022 1.51-.717 1.364-1.51z"
                                  className="logo-xero-blue__text"
                                ></path>
                              </svg>
                            ) : (
                              <Button
                                onClick={() => handleCreatePo(po)}
                                className=" rounded-2xl text-xs !py-1 h-auto px-3"
                                variant={'outline'}
                                size={'sm'}
                              >
                                Sync
                              </Button>
                            )}
                          </td>
                          <td className="px-2 pr-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                                  aria-label={`Actions for ${po.poNumber}`}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Link className="w-full" href={`${pathname}/purchase-order/${po.id}`}>
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <button
                                    onClick={() => {
                                      handleOpenPO(po.id);
                                    }}
                                    className="w-full text-left"
                                  >
                                    Download PDF
                                  </button>
                                </DropdownMenuItem>
                                <DropdownMenuItem>Send Email</DropdownMenuItem>
                                <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Link className="w-full" href={`/finance/purchase-order/${po.id}`}>
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => openDeleteModal(po, 'po')}>
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}

                    {!customLoading &&
                      invoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Checkbox disabled aria-label={`Select ${inv.inNumber}`} />
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                            <Link className="hover:underline" href={`${pathname}/invoices/${inv.id}`}>
                              {inv.inNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">-</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">Invoice</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {inv.issueDate
                              ? new Date(inv.issueDate).toLocaleDateString('en-GB')
                              : new Date(inv.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {inv?.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-GB') : '-'}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                            {project?.currency?.symbol ? project?.currency?.symbol : '£'}
                            {Number(
                              (
                                (inv?.products?.reduce((total, product) => {
                                  return total + parseFloat(product?.amount?.replace(/[^0-9.-]+/g, '')) * product.QTY;
                                }, 0) || 0) + Number(inv.delivery_charge)
                              ).toFixed(2)
                            ).toLocaleString('en-US', {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <InvoiceStatus inv={inv} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            {inv?.xero_invoice_id ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                className="logo-xero-blue mx-auto"
                                viewBox="0 0 45 46"
                                id="xero"
                              >
                                <path
                                  fill="#13B5EA"
                                  d="M22.457 45.49c12.402 0 22.456-10.072 22.456-22.495C44.913 10.57 34.86.5 22.457.5 10.054.5 0 10.57 0 22.995 0 35.418 10.054 45.49 22.457 45.49"
                                  className="logo-xero-blue__circle"
                                ></path>
                                <path
                                  fill="#fff"
                                  d="M10.75 22.935l3.832-3.85a.688.688 0 0 0-.977-.965l-3.83 3.833-3.845-3.84a.687.687 0 0 0-.966.979l3.832 3.837-3.83 3.84a.688.688 0 1 0 .964.981l3.84-3.842 3.825 3.827a.685.685 0 0 0 1.184-.473.68.68 0 0 0-.2-.485l-3.83-3.846m22.782.003c0 .69.56 1.25 1.25 1.25a1.25 1.25 0 0 0-.001-2.5c-.687 0-1.246.56-1.246 1.25m-2.368 0c0-1.995 1.62-3.62 3.614-3.62 1.99 0 3.613 1.625 3.613 3.62s-1.622 3.62-3.613 3.62a3.62 3.62 0 0 1-3.614-3.62m-1.422 0c0 2.78 2.26 5.044 5.036 5.044s5.036-2.262 5.036-5.043c0-2.78-2.26-5.044-5.036-5.044a5.046 5.046 0 0 0-5.036 5.044m-.357-4.958h-.21c-.635 0-1.247.2-1.758.595a.696.696 0 0 0-.674-.54.68.68 0 0 0-.68.684l.002 8.495a.687.687 0 0 0 1.372-.002v-5.224c0-1.74.16-2.444 1.648-2.63.14-.017.288-.014.29-.014.406-.015.696-.296.696-.675a.69.69 0 0 0-.69-.688m-13.182 4.127c0-.02.002-.04.003-.058a3.637 3.637 0 0 1 7.065.055H16.2zm8.473-.13c-.296-1.403-1.063-2.556-2.23-3.296a5.064 5.064 0 0 0-5.61.15 5.098 5.098 0 0 0-1.973 5.357 5.08 5.08 0 0 0 4.274 3.767c.608.074 1.2.04 1.81-.12a4.965 4.965 0 0 0 1.506-.644c.487-.313.894-.727 1.29-1.222.006-.01.014-.017.022-.027.274-.34.223-.826-.077-1.056-.254-.195-.68-.274-1.014.156-.072.104-.153.21-.24.315-.267.295-.598.58-.994.802-.506.27-1.08.423-1.69.427-1.998-.023-3.066-1.42-3.447-2.416a3.716 3.716 0 0 1-.153-.58l-.01-.105h7.17c.982-.022 1.51-.717 1.364-1.51z"
                                  className="logo-xero-blue__text"
                                ></path>
                              </svg>
                            ) : (
                              <Button
                                onClick={() => handleCreate(inv)}
                                className=" rounded-2xl text-xs !py-1 h-auto px-3"
                                variant={'outline'}
                                size={'sm'}
                              >
                                Sync
                              </Button>
                            )}
                          </td>
                          <td className="px-2 pr-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                                  aria-label={`Actions for ${inv.inNumber}`}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Link className="w-full" href={`${pathname}/invoices/${inv.id}`}>
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <button
                                    onClick={() => {
                                      handleOpenInvoice(inv.id);
                                    }}
                                    className="w-full text-left"
                                  >
                                    Download PDF
                                  </button>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendToClient(inv)}>Send As Thread</DropdownMenuItem>
                                {/* <DropdownMenuItem>Mark as Paid</DropdownMenuItem> */}
                                <DropdownMenuItem>
                                  <Link className="w-full" href={`/finance/invoices/${inv.id}`}>
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => openDeleteModal(inv, 'inv')}>
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}

                    {!customLoading &&
                      !XeroLoading &&
                      myXeroInvoice?.length > 0 &&
                      myXeroInvoice.map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Checkbox disabled aria-label={`Select ${inv.InvoiceNumber}`} />
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                            <button onClick={() => viewInvoicePDF(inv.InvoiceID)} className="hover:underline">
                              {inv.InvoiceNumber}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">-</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">Invoice</td>

                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {inv?.DateString ? new Date(inv.DateString).toLocaleDateString('en-GB') : '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {inv?.DueDateString ? new Date(inv.DueDateString).toLocaleDateString('en-GB') : '-'}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                            {inv?.CurrencyCode}{' '}
                            {Number(inv?.Total).toLocaleString('en-GB', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={inv.Status} label={inv.Status} className={getStatusStyle(inv.Status)} />
                          </td>
                          <td className="px-2 pr-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                                  aria-label={`Actions for ${inv.inNumber}`}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <p className="w-full" onClick={() => viewInvoicePDF(inv.InvoiceID)}>
                                    View Details
                                  </p>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <p className="w-full" onClick={() => viewInvoicePDF(inv.InvoiceID)}>
                                    Download PDF
                                  </p>
                                </DropdownMenuItem>
                                <DropdownMenuItem>Send Email</DropdownMenuItem>
                                <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                                {/* <DropdownMenuItem>
                                <Link className="w-full" href={`/finance/invoices/${inv.id}`}>
                                  Edit
                                </Link>
                              </DropdownMenuItem> */}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                  </>
                  {/* {!isLoading && !InvoiceLoading && !customLoading && (
                  )} */}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={openSendInvoice} onOpenChange={setOpenSendInvoice}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Invoice as Thread</DialogTitle>
          </DialogHeader>

          {currentInvoice && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="recipient">
                  Thread Title <span className="text-red-500">*</span>{' '}
                </Label>
                <Input id="recipient" placeholder="eg.This need urgent approval" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">
                  Thread Details <span className="text-gray-400">(Optional)</span>{' '}
                </Label>
                <Textarea id="description" placeholder="" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="bg-gray-50 p-3 rounded-md border">
                <p className="text-sm text-gray-800 font-medium">Invoice: {currentInvoice.inNumber}</p>
                <p className="text-sm text-gray-600">
                  Issue Date: {new Date(currentInvoice.issueDate || currentInvoice.created_at).toLocaleDateString('en-GB')}
                </p>
                <p className="text-sm text-gray-600">
                  Due Date: {currentInvoice.dueDate ? new Date(currentInvoice.dueDate).toLocaleDateString('en-GB') : '-'}
                </p>
                <p className="text-sm text-gray-600">
                  Total: {project?.currency?.symbol || '£'}
                  {Number(
                    (
                      (currentInvoice?.products?.reduce((total, product) => {
                        return total + parseFloat(product?.amount?.replace(/[^0-9.-]+/g, '')) * product.QTY;
                      }, 0) || 0) + Number(currentInvoice.delivery_charge)
                    ).toFixed(2)
                  ).toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenSendInvoice(false)}>
              Cancel
            </Button>
            <Button disabled={title.trim().length < 1} onClick={handleSubmit}>
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => handleDelete(selectedPo?.id)}
        title="Delete PO/IN?"
        description="Are you sure you want to delete this? This action cannot be undone."
        itemName={isPo ? selectedPo?.poNumber : selectedPo?.inNumber}
        requireConfirmation={false}
      />
    </div>
  );
}
