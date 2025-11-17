import { StatusBadge } from '@/components/chip';
import React from 'react';
import { useQuery } from '@tanstack/react-query';

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

async function fetchInvoiceStatus(xeroId: string) {
  const res = await fetch(`https://be.techstyles.ai/api/invoice/${xeroId}/status/`);

  if (!res.ok) {
    throw new Error('Failed to fetch status');
  }

  return res.json(); // Expected { status: "paid" }
}

const InvoiceStatus = ({ inv }) => {
  const hasXero = Boolean(inv.xero_invoice_id);

  // Enable only if invoice has a remote status ID
  const { data, isLoading } = useQuery({
    queryKey: ['invoice-status', inv.xero_invoice_id],
    queryFn: () => fetchInvoiceStatus(inv.xero_invoice_id),
    enabled: hasXero, // prevents running when no xero_invoice_id
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  const status = data?.status || inv.status;

  if (isLoading) {
    return <StatusBadge status="loading" label="Checking..." className={getStatusStyle('loading')} />;
  }

  return <StatusBadge status={status} label={status} className={getStatusStyle(status)} />;
};

export default InvoiceStatus;
