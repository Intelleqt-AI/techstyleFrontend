'use client';

import { ProjectNav } from '@/components/project-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/chip';
import { FileText, ShoppingCart, Plus, RefreshCw, Search, Filter, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import {
  createXeroInvoice,
  deleteInvoices,
  deletePurchaseOrder,
  fetchInvoices,
  fetchOnlyProject,
  getInvoices,
  getPurchaseOrder,
  updateInvoice,
} from '@/supabase/API';
import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createInvoice } from '@/supabase/API';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { DeleteDialog } from '@/components/DeleteDialog';
import { useCurrency } from '@/hooks/useCurrency';

export default function FinancePage() {
  const [purchaseOrder, setPurchaseOrder] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [buttonLoadingPO, setButtonLoadingPO] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);
  const [isPo, setIsPo] = useState(null);
  const { currency, isLoading: currencyLoading } = useCurrency();
  const router = useRouter();
  const [xeroConnected, setXeroConnected] = useState(false);
  const statuses = ['All', 'Pending', 'Sent', 'Received', 'Paid'];

  const { data: project } = useQuery({
    queryKey: [`fetchOnlyProject`],
    queryFn: () => fetchOnlyProject({ projectID: null }),
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pruchaseOrder'],
    queryFn: getPurchaseOrder,
  });

  const {
    data: xeroInvoices,
    isLoading: XeroLoading,
    isError,
    error,
    refetch: fetchInvoice,
  } = useQuery({
    queryKey: ['xeroInvoices'],
    queryFn: fetchInvoices,
    enabled: !!xeroConnected,
  });

  const {
    data: InvoiceData,
    isLoading: InvoiceLoading,
    refetch: InvoiceRefetch,
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  });

  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filteredPurchaseOrders, setFilteredPurchaseOrders] = useState([]);
  const [filteredXeroInvoices, setFilteredXeroInvoices] = useState([]);

  const [searchText, setSearchText] = useState('');
  const [sort, setSort] = useState('');

  const safeIncludes = (value, search) => typeof value === 'string' && value.toLowerCase().includes(search);

  const getStatus = item => {
    const raw = item?.status || item?.Status;
    return typeof raw === 'string' ? raw.toLowerCase() : '';
  };

  const filterData = (data, searchText, sort) => {
    let filtered = [...data];

    // 🔎 Search filter
    if (searchText.trim() !== '') {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
        item =>
          safeIncludes(item?.inNumber, lower) ||
          safeIncludes(item?.poNumber, lower) ||
          safeIncludes(item?.orderNumber, lower) ||
          safeIncludes(item?.InvoiceNumber, lower)
      );
    }

    // ✅ Status filter (normalize both)
    switch (sort) {
      case 'Pending':
        filtered = filtered.filter(item => getStatus(item) === 'pending');
        break;
      case 'Sent':
        filtered = filtered.filter(item => getStatus(item) === 'sent');
        break;
      case 'Received':
        filtered = filtered.filter(item => getStatus(item) === 'received');
        break;
      case 'Paid':
        filtered = filtered.filter(item => getStatus(item) === 'paid');
        break;
      default:
        break;
    }

    return filtered;
  };

  useEffect(() => {
    setFilteredInvoices(filterData(invoices, searchText, sort));
    setFilteredPurchaseOrders(filterData(purchaseOrder, searchText, sort));
    setFilteredXeroInvoices(filterData(xeroInvoices ? xeroInvoices : [], searchText, sort));
  }, [invoices, purchaseOrder, xeroInvoices, searchText, sort]);

  const mutation = useMutation({
    mutationFn: updateInvoice,
    onSuccess: () => {
      InvoiceRefetch();
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('xero_access_token');
    async function checkXeroConnection(accessToken) {
      if (!accessToken) return;

      try {
        const res = await fetch('https://xero-backend-pi.vercel.app/api/check-xero-connection', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('xero_access_token')}`,
          },
        });
        const result = await res.json();
        if (!res.ok) {
          console.error('Xero API error:', res.status);
          return false;
        }

        if (result?.connected) {
          setXeroConnected(true);
        }
      } catch (err) {
        console.error('Fetch/network error:', err.message);
        return false;
      }
    }

    checkXeroConnection(token);
  }, []);

  const {
    mutate: createInvoiceMutate,
    data: createdInvoice,
    isPending,
  } = useMutation({
    mutationFn: createXeroInvoice,
    onSuccess(data, variables, context) {
      toast.success('Invoice Added');
      fetchInvoice();
    },
  });

  const xeroStatusMap = {
    Pending: 'DRAFT',
    Approved: 'SUBMITTED',
  };

  useEffect(() => {
    if (isLoading) return;
    setPurchaseOrder(data?.data);
  }, [isLoading, data?.data]);

  useEffect(() => {
    if (InvoiceLoading) return;
    setInvoices(InvoiceData?.data);
  }, [InvoiceLoading, InvoiceData?.data]);

  const handleRefetch = () => {
    fetchInvoice();
    refetch();
    InvoiceRefetch();
  };

  const handleSync = () => {
    const createToastContent = () => (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div>
            <div className="font-sm">Please connect Xero</div>
          </div>
        </div>
        {/* Undo button inside content */}
        <button
          onClick={() => {
            router.push('/settings/studio/integrations');
          }}
          className="px-3 py-1 text-sm bg-black text-white rounded  transition-colors ml-4"
        >
          Connect Now
        </button>
      </div>
    );

    if (!xeroConnected) {
      toast.warning(createToastContent(), {
        duration: 3000,
      });
      return;
    }
    setCustomLoading(true);
    setTimeout(() => {
      handleRefetch();
      setCustomLoading(false);
    }, 2000);
  };

  const createInvoiceOrder = useMutation({
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
    if (checkedItems?.length == 0) {
      router.push('/finance/invoices/new');
      return;
    }

    setButtonLoadingPO(true);
    console.log(checkedItems);
    createInvoiceOrder.mutate({
      invoice: {
        // projectID: id,
        status: 'Pending',
        clientName: checkedItems[0]?.clientName,
        clientEmail: checkedItems[0]?.clientEmail,
        clientPhone: checkedItems[0]?.clientPhone,
        clientAddress: checkedItems[0]?.clientAddress,
        delivery_charge: checkedItems.reduce((acc, sum) => acc + sum?.delivery_charge, 0),
        poNumber: checkedItems.map(item => item.poNumber),
        products: checkedItems.flatMap(item => item.products),
        synced: false,
      },
    });
  };

  // const handleInvoice = () => {
  //   if (!checkedItems || checkedItems.length === 0) {
  //     router.push('/finance/invoices/new');
  //     return;
  //   }
  //   setButtonLoadingPO(true);

  //   const groupedBySupplier = checkedItems.reduce((acc, item) => {
  //     const supplierId = item.supplier?.id;
  //     if (!supplierId) return acc;
  //     if (!acc[supplierId]) {
  //       acc[supplierId] = [];
  //     }
  //     acc[supplierId].push(item);
  //     return acc;
  //   }, {});

  //   Object.values(groupedBySupplier).forEach(itemsForSupplier => {
  //     const firstItem = itemsForSupplier[0];
  //     createInvoiceOrder.mutate({
  //       invoice: {
  //         // --- Supplier Details (replaces client details) ---
  //         supplierID: firstItem.supplier?.id,
  //         supplierName: firstItem.supplier?.name,
  //         supplierEmail: firstItem.supplier?.email,
  //         supplierPhone: firstItem.supplier?.phone,
  //         supplierAddress: firstItem.supplier?.address,

  //         // --- Aggregated Data for this specific supplier's items ---
  //         delivery_charge: itemsForSupplier.reduce((total, item) => total + (item?.delivery_charge || 0), 0),
  //         poNumber: itemsForSupplier.map(item => item.poNumber),
  //         products: itemsForSupplier.flatMap(item => item.products),

  //         // --- Other invoice details ---
  //         status: 'Pending',
  //         synced: false,
  //         // You might want to get the projectID from the first item as well
  //         // projectID: firstItem?.projectID,
  //       },
  //     });
  //   });

  //   // Note: You might want to handle the button loading state (setButtonLoadingPO(false))
  //   // in the `onSuccess` or `onSettled` callback of your `createInvoiceOrder.mutate` hook.
  // };

  // Create Xero Invoice
  const handleCreate = inv => {
    if (!xeroConnected) {
      toast.warning('Please connect Xero');
      return;
    }
    // Map your products to Xero LineItems
    const lineItems = inv.products.map(p => ({
      Description: p.itemName,
      Quantity: p.QTY,
      UnitAmount: parseFloat(p.amount),
      AccountCode: '200',
    }));

    // Create the invoice object
    const invoicePayload = {
      Invoices: [
        {
          Type: 'ACCREC',
          Contact: {
            Name: inv.clientName,
          },
          Date: inv.issueDate.split('T')[0],
          DueDate: inv.dueDate ? inv.dueDate.split('T')[0] : inv.issueDate.split('T')[0],
          InvoiceNumber: inv.inNumber,
          Reference: inv.poNumber?.join(', ') || '',
          CurrencyCode: currency?.code,
          Status: xeroStatusMap[inv?.status] || 'DRAFT',
          LineAmountTypes: 'Exclusive',
          LineItems: lineItems,
        },
      ],
    };

    // Call the mutation
    createInvoiceMutate(invoicePayload);
    mutation.mutate({ invoice: { ...inv, synced: true } });
  };

  // Calculate totals for stats
  let totalPurchaseOrder = 0;
  let totalInvoiceOrder = 0;

  invoices.forEach(item => {
    const temp =
      item?.products?.reduce((total, product) => {
        const amount = parseFloat(product.amount.replace(/[^0-9.-]+/g, ''));
        return total + amount * product.QTY;
      }, 0) || 0;

    totalInvoiceOrder += temp;
  });

  const xeroTotal = useMemo(() => {
    let totalInvoiceOrder = 0;
    xeroInvoices?.forEach(item => {
      const temp = item?.Total || 0;
      totalInvoiceOrder += temp;
    });
    return totalInvoiceOrder;
  }, [xeroInvoices]);

  purchaseOrder.forEach(item => {
    const temp =
      item?.products?.reduce((total, product) => {
        const amount = parseFloat(product.amount.replace(/[^0-9.-]+/g, ''));
        return total + amount * product.QTY;
      }, 0) || 0;

    totalPurchaseOrder += temp;
  });

  const financeStats = [
    {
      title: 'Total Invoices',
      value: `${!currencyLoading ? currency?.symbol || '£' : ''}${(totalInvoiceOrder || 0) + (xeroTotal || 0)}`,

      subtitle: `${(invoices?.length || 0) + (xeroInvoices?.length || 0)} ${
        (invoices?.length || 0) + (xeroInvoices?.length || 0) === 1 ? 'Invoice' : 'Invoices'
      } (${xeroInvoices?.length || 0} from Xero)`,
      icon: FileText,
    },

    {
      title: 'Total Purchase Orders',
      value: `${!currencyLoading ? currency?.symbol || '£' : ''}${totalPurchaseOrder || 0}`,
      subtitle: `${purchaseOrder?.length} ${purchaseOrder?.length === 1 ? 'Purchase Order' : 'Purchase Orders'}`,
      icon: ShoppingCart,
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
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

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Finance Stats (restored inline cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {financeStats.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gray-500" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-lg font-semibold text-gray-900 tabular-nums leading-tight">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search invoices and POs..."
                className="pl-10 w-64"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                aria-label="Search invoices and purchase orders"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  {sort || 'Filter'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                {statuses.map(status => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setSort(status === 'All' ? '' : status)}
                    className={sort === status ? 'font-semibold text-black' : ''}
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <Button className="bg-gray-900 text-white hover:bg-gray-800" onClick={handleInvoice} disabled={buttonLoadingPO}>
              <Plus className="w-4 h-4 mr-2" />
              {buttonLoadingPO ? 'Creating...' : 'Create Invoice'}
            </Button>
            <Button onClick={handleSync} disabled={InvoiceLoading || isLoading || customLoading} variant="outline">
              {customLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sync with Xero
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync with Xero
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Finance Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              {/* Sticky header, Title Case, no ALL CAPS */}
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <span className="sr-only">{'Select row'}</span>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">Number</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-52">Supplier / Client</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-40">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-56">Project</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">Date Issued</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">Due Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-28">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 whitespace-nowrap w-28">Sync</th>
                  <th className="pl-4 pr-6 py-3 text-right text-sm font-medium text-gray-600 whitespace-nowrap w-24">Actions</th>
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
                    filteredPurchaseOrders.map(po => (
                      <tr key={po.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={!!checkedItems.find(checkItem => checkItem.id == po.id)}
                            onCheckedChange={checked => handleChange({ target: { value: po, checked } })}
                            aria-label={`Select ${po.poNumber}`}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          <Link className="hover:underline" href={`/finance/purchase-order/${po.id}`}>
                            {po.poNumber}
                          </Link>
                        </td>
                        <td className="px-4 truncate py-3 text-gray-600 whitespace-nowrap">{po?.supplier?.company || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">Purchase Order</td>
                        <td className="px-4 py-3 text-gray-600 truncate whitespace-nowrap">
                          {' '}
                          {project?.find(item => item.id == po?.projectID)?.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {po.issueDate ? new Date(po.issueDate).toLocaleDateString('en-GB') : new Date(po.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {po?.dueDate ? new Date(po.dueDate).toLocaleDateString('en-GB') : '-'}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          {!currencyLoading && (currency?.symbol || '£')}
                          {(
                            po?.products?.reduce((total, product) => {
                              return total + parseFloat(product.amount.replace(/[^0-9.-]+/g, '')) * product.QTY;
                            }, 0) || 0
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={po.status} label={po.status} className={getStatusStyle(po.status)} />
                        </td>
                        <td className="px-4 text-center py-3">-</td>
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
                                <Link className="w-full" href={`/finance/purchase-order/${po.id}`}>
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link className="w-full" href={`/finance/purchase-order/pdf/${po.id}`}>
                                  Download PDF
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Send Email</DropdownMenuItem>
                              <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link className="w-full" href={`/finance/purchase-order/${po.id}`}>
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => openDeleteModal(po, 'po')}>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}

                  {!customLoading &&
                    filteredInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Checkbox disabled aria-label={`Select ${inv.inNumber}`} />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          <Link className="hover:underline" href={`/finance/invoices/${inv.id}`}>
                            {inv.inNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{inv?.clientName}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">Invoice</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {project?.find(item => item.id == inv?.projectID)?.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {inv.issueDate
                            ? new Date(inv.issueDate).toLocaleDateString('en-GB')
                            : new Date(inv.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {inv?.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-GB') : '-'}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          {!currencyLoading && (currency?.symbol || '£')}
                          {Number(
                            (
                              (inv?.products?.reduce((total, product) => {
                                return total + parseFloat(product.amount.replace(/[^0-9.-]+/g, '')) * product.QTY;
                              }, 0) || 0) + Number(inv.delivery_charge)
                            ).toFixed(2)
                          ).toLocaleString('en-US', {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={inv.status} label={inv.status} className={getStatusStyle(inv.status)} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {inv?.synced ? (
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
                              <DropdownMenuItem onClick={() => handleCreate(inv)}>Sync with Xero</DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link className="w-full" href={`/finance/invoices/${inv.id}`}>
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link className="w-full" href={`/finance/invoices/pdf/${inv.id}`}>
                                  Download PDF
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Send Email</DropdownMenuItem>
                              <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
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
                    xeroInvoices?.length > 0 &&
                    filteredXeroInvoices.map(inv => (
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
                          {project?.find(item => item.id == inv?.projectID)?.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {inv?.DateString ? new Date(inv.DateString).toLocaleDateString('en-GB') : '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {inv?.DueDateString ? new Date(inv.DueDateString).toLocaleDateString('en-GB') : '-'}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          {currency?.symbol || '£'} {inv?.Total}
                        </td>
                        <td className="px-4 py-3 capitalize">
                          <StatusBadge status={inv.Status} label={inv.Status} className={getStatusStyle(inv.Status)} />
                        </td>
                        <td className="px-4 py-3 text-center ">
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
              </tbody>
            </table>
          </div>
          {/* 
          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices or purchase orders found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or create your first invoice</p>
              <Button className="bg-gray-900 text-white hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          )} */}
        </div>
      </div>

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
