import { StatusBadge } from '@/components/chip';
import React, { useState, useEffect } from 'react';

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

const InvoiceStatus = ({ inv }) => {
  // 1. Initialize state with the status from the prop
  const [currentStatus, setCurrentStatus] = useState(inv.status);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInvoiceStatus = async () => {
      if (inv.xero_invoice_id) {
        setIsLoading(true);
        try {
          const response = await fetch(`https://be.techstyles.ai/api/invoice/${inv.xero_invoice_id}/status/`);

          if (!response.ok) {
            throw new Error('Failed to fetch status');
          }

          const data = await response.json(); // Assuming API returns { "status": "paid" }

          // 4. Update the component's local state with the new status
          if (data.status) {
            setCurrentStatus(data.status);
          }
        } catch (error) {
          console.error('Error fetching invoice status:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCurrentStatus(inv.status);
      }
    };

    fetchInvoiceStatus();

    // Rerun this effect if any of these invoice properties change
  }, [inv.id, inv.status, inv.xero_invoice_id]);

  // Optionally show a loading state
  if (isLoading) {
    return <StatusBadge status="loading" label="Checking..." className={getStatusStyle('loading')} />;
  }

  // 6. Render the badge with the correct (original or fetched) status
  return <StatusBadge status={currentStatus} label={currentStatus} className={getStatusStyle(currentStatus)} />;
};

export default InvoiceStatus;
