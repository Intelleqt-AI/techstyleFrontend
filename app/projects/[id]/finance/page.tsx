'use client';

import { ProjectNav } from '@/components/project-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/chip';
import { FileText, ShoppingCart, Plus, RefreshCw, Search, Filter, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { fetchInvoices, fetchOnlyProject, getInvoices, getPurchaseOrder } from '@/supabase/API';
import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createInvoice } from '@/supabase/API';
import { toast } from 'sonner';
// import { useNavigate } from 'react-router-dom'
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

const gbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
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

  const id = params.id;

  const { data: project } = useQuery({
    queryKey: [`project ${id}`],
    queryFn: () => fetchOnlyProject({ projectID: id }),
    enabled: !!id,
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
  });

  const {
    data: InvoiceData,
    isLoading: InvoiceLoading,
    refetch: InvoiceRefetch,
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  });

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
        const amount = parseFloat(product.amount.replace(/[^0-9.-]+/g, ''));
        return total + amount * product.QTY;
      }, 0) || 0;

    totalInvoiceOrder += temp;
  });

  purchaseOrder.forEach(item => {
    const temp =
      item?.products?.reduce((total, product) => {
        const amount = parseFloat(product.amount.replace(/[^0-9.-]+/g, ''));
        return total + amount * product.QTY;
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
    xeroInvoices?.forEach(item => {
      const temp = item?.Total || 0;
      totalInvoiceOrder += temp;
    });
    return totalInvoiceOrder;
  }, [xeroInvoices]);

  const financeStats = [
    {
      title: 'Total Invoices',
      value: project?.currency?.symbol
        ? project.currency.symbol +
          (totalInvoiceOrder + xeroTotal).toLocaleString('en-US', {
            maximumFractionDigits: 2,
          })
        : gbp.format(totalInvoiceOrder),
      subtitle: `${(invoices?.length ?? 0) + (xeroInvoices?.length ?? 0)} ${
        (invoices?.length ?? 0) + (xeroInvoices?.length ?? 0) === 1 ? 'Invoice' : 'Invoices'
      }${xeroInvoices?.length ? ` (${xeroInvoices.length} from Xero)` : ''}`,

      icon: FileText,
    },
    {
      title: 'Total Purchase Orders',
      value: project?.currency?.symbol
        ? project.currency.symbol +
          totalPurchaseOrder.toLocaleString('en-US', {
            maximumFractionDigits: 2,
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
            <Button
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
            </Button>
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
                            <Link className="hover:underline" href={`/finance/purchase-order/${po.id}`}>
                              {po.poNumber}
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
                            <Link className="hover:underline" href={`/finance/invoices/${inv.id}`}>
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
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}

                    {!customLoading &&
                      !XeroLoading &&
                      xeroInvoices?.length > 0 &&
                      xeroInvoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Checkbox disabled aria-label={`Select ${inv.InvoiceNumber}`} />
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                            <button onClick={() => viewInvoicePDF(item.InvoiceID)} className="hover:underline">
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
                            {inv?.CurrencyCode} {inv?.Total}
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
    </div>
  );
}
