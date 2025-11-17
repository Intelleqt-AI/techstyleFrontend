import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function BillingStatusDots({
  invoiceId,
  invoiceSentAt,
  clientPaidAt,
}: {
  invoiceId: string | null;
  invoiceSentAt: string | null;
  clientPaidAt: string | null;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-neutral-600">
      <div className="flex items-center gap-1" title="Invoice created">
        <div
          className={cn('w-3 h-3 rounded-full shrink-0 border-2', invoiceId ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300')}
        />
        <span className="hidden xl:inline">Created</span>
      </div>
      <div className="flex items-center gap-1" title="Invoice sent to client">
        <div
          className={cn(
            'w-3 h-3 rounded-full shrink-0 border-2',
            invoiceSentAt ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300'
          )}
        />
        <span className="hidden xl:inline">Sent</span>
      </div>
      <div className="flex items-center gap-1" title="Client paid">
        <div
          className={cn(
            'w-3 h-3 rounded-full shrink-0 border-2',
            clientPaidAt ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300'
          )}
        />
        <span className="hidden xl:inline">Paid</span>
      </div>
    </div>
  );
}

async function fetchPoStatus(xeroPoNumber) {
  const res = await fetch(`https://be.techstyles.ai/api/bill/${xeroPoNumber}/status/`);
  if (!res.ok) throw new Error('Failed to fetch PO status');
  return res.json(); // { status, po_number }
}

async function fetchInvoiceStatus(xeroInvNumber) {
  const res = await fetch(`https://be.techstyles.ai/api/invoice/${xeroInvNumber}/status/`);
  if (!res.ok) throw new Error('Failed to fetch invoice status');
  return res.json(); // { status, invoice_number }
}

function BillingCell({ item, room, loadingProductIdForInv, clickHandleInvoice, allPOs }) {
  const hasPo = Boolean(item?.xeroPoNumber);
  const hasInv = Boolean(item?.xeroInvNumber);

  // ------------------------
  // 1. Fetch PO status
  // ------------------------
  const { data: poData } = useQuery({
    queryKey: ['po-status', item?.xeroPoNumber],
    queryFn: () => fetchPoStatus(item?.xeroPoNumber),
    enabled: hasPo,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // You were calling: data.data.find(item => item.poNumber == po_number)
  // I'm assuming "data" is coming from props OR context in your real code.
  // Replace "allPOs" with actual array.
  const po = poData?.po_number ? allPOs?.find(p => p.poNumber === poData.po_number) : null;

  // ------------------------
  // 2. Fetch Invoice status
  // ------------------------
  const { data: invoiceData, isLoading: isInvoiceLoading } = useQuery({
    queryKey: ['invoice-status', item?.xeroInvNumber],
    queryFn: () => fetchInvoiceStatus(item?.xeroInvNumber),
    enabled: hasInv,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // ------------------------
  // CASE: No invoice exists → show “Create invoice”
  // ------------------------
  if (!hasInv) {
    return (
      <div className="flex flex-col gap-1.5">
        <Button
          disabled={loadingProductIdForInv === item.id || (!item?.xeroPoNumber && !item?.xeroInvNumber)}
          variant="ghost"
          size="sm"
          onClick={() => clickHandleInvoice(item, room, po)}
          className="h-8 px-2 text-sm whitespace-nowrap w-fit text-neutral-800"
        >
          {loadingProductIdForInv === item.id ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </div>
          ) : (
            'Create invoice'
          )}
        </Button>
      </div>
    );
  }

  // ------------------------
  // CASE: Invoice exists → Show invoice details
  // ------------------------
  return (
    <div className="flex flex-col gap-1.5">
      <button className="text-sm text-primary hover:underline text-left whitespace-nowrap">
        {isInvoiceLoading ? 'Loading..' : invoiceData?.invoice_number || 'Unknown'}
      </button>

      <BillingStatusDots invoiceId={true} invoiceSentAt={true} clientPaidAt={invoiceData?.status === 'PAID'} />
    </div>
  );
}

export default BillingCell;
