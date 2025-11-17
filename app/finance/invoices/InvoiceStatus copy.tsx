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

async function fetchPoStatus(poId: string) {
  const res = await fetch(`https://be.techstyles.ai/api/bill/${poId}/status/`);
  if (!res.ok) {
    throw new Error('Failed to fetch status');
  }
  return res.json(); // expected { status: "paid" }
}

const PoStatus = ({ po }) => {
  const hasXero = Boolean(po.xero_po_id);

  const { data, isLoading } = useQuery({
    queryKey: ['po-status', po.xero_po_id],
    queryFn: () => fetchPoStatus(po.xero_po_id),
    enabled: hasXero, // only run when PO has a Xero ID
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false, // don't spam API when switching windows
  });

  const status = data?.status || po.status;

  if (isLoading) {
    return <StatusBadge status="loading" label="Checking..." className={getStatusStyle('loading')} />;
  }

  return <StatusBadge status={status} label={status} className={getStatusStyle(status)} />;
};

export default PoStatus;
