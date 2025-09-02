'use client';

import { ProjectNav } from '@/components/project-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/chip';
import { FileText, ShoppingCart, Plus, RefreshCw, Search, Filter, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { fetchOnlyProject, getInvoices, getPurchaseOrder } from '@/supabase/API';
import { useEffect, useState } from 'react';
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

const financeStats = [
  {
    title: 'Total Invoices',
    value: '£425,000',
    subtitle: '24 Invoices',
    icon: FileText,
  },
  {
    title: 'Total Purchase Orders',
    value: '£128,500',
    subtitle: '18 Purchase Orders',
    icon: ShoppingCart,
  },
];

const studioFinanceData = [
  {
    id: 1,
    number: 'INV-001',
    supplier: 'Smith Family',
    type: 'Invoice',
    project: 'Luxury Penthouse',
    dateIssued: '2024-11-01',
    dueDate: '2024-12-01',
    amount: '£25,000.00',
    status: 'paid',
  },
  {
    id: 2,
    number: 'PO-002',
    supplier: 'West Elm',
    type: 'Purchase Order',
    project: 'Modern Office',
    dateIssued: '2024-11-03',
    dueDate: '2024-11-17',
    amount: '£2,450.00',
    status: 'approved',
  },
  {
    id: 3,
    number: 'INV-003',
    supplier: 'TechCorp Inc.',
    type: 'Invoice',
    project: 'Modern Office',
    dateIssued: '2024-11-03',
    dueDate: '2024-12-03',
    amount: '£15,000.00',
    status: 'pending',
  },
  {
    id: 4,
    number: 'PO-004',
    supplier: 'John Lewis',
    type: 'Purchase Order',
    project: 'Boutique Hotel',
    dateIssued: '2024-10-28',
    dueDate: '2024-11-11',
    amount: '£1,890.00',
    status: 'approved',
  },
  {
    id: 5,
    number: 'INV-005',
    supplier: 'Grandeur Hotels',
    type: 'Invoice',
    project: 'Boutique Hotel',
    dateIssued: '2024-10-25',
    dueDate: '2024-11-25',
    amount: '£8,500.00',
    status: 'overdue',
  },
  {
    id: 6,
    number: 'INV-006',
    supplier: 'Johnson Family',
    type: 'Invoice',
    project: 'Kitchen Remodel',
    dateIssued: '2024-11-05',
    dueDate: '2024-12-05',
    amount: '£12,000.00',
    status: 'draft',
  },
  {
    id: 7,
    number: 'PO-007',
    supplier: 'Habitat',
    type: 'Purchase Order',
    project: 'Luxury Penthouse',
    dateIssued: '2024-11-02',
    dueDate: '2024-11-16',
    amount: '£3,200.00',
    status: 'pending',
  },
  {
    id: 8,
    number: 'INV-008',
    supplier: 'Design Studio Ltd',
    type: 'Invoice',
    project: 'Corporate Headquarters',
    dateIssued: '2024-11-04',
    dueDate: '2024-12-04',
    amount: '£18,750.00',
    status: 'paid',
  },
];

export default function FinancePage() {
  const [purchaseOrder, setPurchaseOrder] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [buttonLoadingPO, setButtonLoadingPO] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);
  // const navigate = useNavigate()

  const { data: project } = useQuery({
    queryKey: [`project`],
    queryFn: () => fetchOnlyProject({ projectID: null }),
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pruchaseOrder'],
    queryFn: getPurchaseOrder,
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
    setPurchaseOrder(data?.data);
  }, [isLoading, data?.data]);

  useEffect(() => {
    if (InvoiceLoading) return;
    setInvoices(InvoiceData?.data);
  }, [InvoiceLoading, InvoiceData?.data]);

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

  const financeStats = [
    {
      title: 'Total Invoices',
      value: gbp.format(totalInvoiceOrder),
      subtitle: `${invoices?.length} ${invoices?.length === 1 ? 'Invoice' : 'Invoices'}`,
      icon: FileText,
    },
    {
      title: 'Total Purchase Orders',
      value: gbp.format(totalPurchaseOrder),
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
                // value={searchTerm}
                // onChange={e => setSearchTerm(e.target.value)}
                aria-label="Search invoices and purchase orders"
              />
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
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync with Xero
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-52">Supplier</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-40">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-56">Project</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">Date Issued</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">Due Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-32">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-28">Status</th>
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
                  {purchaseOrder.map(po => (
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
                        {/* {project?.currency?.symbol ? project?.currency?.symbol : '£'} */}£
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

                  {invoices.map(inv => (
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
                        {/* {project?.currency?.symbol ? project?.currency?.symbol : '£'} */}£
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
    </div>
  );
}
