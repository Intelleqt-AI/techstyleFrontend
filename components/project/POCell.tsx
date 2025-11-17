import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function POStatusDots({ poId, poSentAt, supplierPaidAt }: { poId: string | null; poSentAt: string | null; supplierPaidAt: string | null }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-neutral-600">
      <div className="flex items-center gap-1" title="PO created">
        <div
          className={cn('w-3 h-3 rounded-full shrink-0 border-2', poId ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300')}
        />
        <span className="hidden xl:inline">Created</span>
      </div>
      <div className="flex items-center gap-1" title="PO sent to supplier">
        <div
          className={cn('w-3 h-3 rounded-full shrink-0 border-2', poSentAt ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300')}
        />
        <span className="hidden xl:inline">Sent</span>
      </div>
      <div className="flex items-center gap-1" title="Supplier paid">
        <div
          className={cn(
            'w-3 h-3 rounded-full shrink-0 border-2',
            supplierPaidAt ? 'bg-[#8FA989] border-[#8FA989]' : 'bg-white border-gray-300'
          )}
        />
        <span className="hidden xl:inline">Paid</span>
      </div>
    </div>
  );
}

async function fetchPoStatus(poNumber: string) {
  const res = await fetch(`https://be.techstyles.ai/api/bill/${poNumber}/status/`);
  if (!res.ok) throw new Error('Failed to fetch status');

  return res.json(); // expected { status: "PAID", po_number: "PO-0123" }
}

function POCell({ item, room, loadingProductId, handleClickPO }) {
  const hasXero = Boolean(item?.xeroPoNumber);

  const { data, isLoading } = useQuery({
    queryKey: ['po-status', item?.xeroPoNumber],
    queryFn: () => fetchPoStatus(item?.xeroPoNumber),
    enabled: hasXero,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const currentStatus = data?.status || null;
  const invoiceNumber = data?.po_number || 'Loading..';

  // -------------------------
  // Case 1: No PO exists yet
  // -------------------------
  if (!hasXero) {
    return (
      <div className="flex flex-col gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleClickPO(item, room)}
          disabled={loadingProductId === item.id || !item?.matchedProduct?.supplier || item.status !== 'approved'}
          className={cn(
            'h-8 px-2 text-sm whitespace-nowrap w-fit',
            item?.matchedProduct?.supplier && item.status === 'approved'
              ? 'text-primary hover:bg-primary/10'
              : 'text-neutral-400 cursor-not-allowed',
            loadingProductId === item.id && 'cursor-wait opacity-70'
          )}
        >
          {loadingProductId === item.id ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </div>
          ) : (
            'Create PO'
          )}
        </Button>
      </div>
    );
  }

  // -------------------------
  // Case 2: PO exists → show details
  // -------------------------
  return (
    <div className="flex flex-col gap-1.5">
      <button className="text-sm text-primary font-normal hover:underline text-left whitespace-nowrap">
        {isLoading ? 'Loading...' : invoiceNumber}
      </button>

      <POStatusDots poId={true} poSentAt={true} supplierPaidAt={currentStatus === 'PAID'} />
    </div>
  );
}

export default POCell;
