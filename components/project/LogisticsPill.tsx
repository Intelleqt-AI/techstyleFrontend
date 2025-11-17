// --- Imports (assuming paths) ---
import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
// --- End Imports ---

export default function LogisticsPill({ item, room, handleChangeLogistics }) {
  const labels = {
    'not-ordered': 'Not ordered',
    ordered: 'Ordered',
    dispatching: 'Dispatching',
    'in-transit': 'In transit',
    delivered: 'Delivered',
    'qc-issue': 'Back-ordered',
  };

  const defaultColor = 'bg-greige-100 text-taupe-700 border-greige-500';

  const colors = {
    'not-ordered': 'bg-greige-100 text-taupe-700 border-greige-500',
    ordered: 'bg-slatex-500/10 text-slatex-700 border-slatex-500/20',
    dispatching: 'bg-ochre-300/30 text-ochre-700 border-ochre-700/30',
    'in-transit': 'bg-slatex-500/10 text-slatex-700 border-slatex-500/20',
    delivered: 'bg-sage-300/50 text-olive-700 border-olive-700/20',
    'qc-issue': 'bg-terracotta-600/10 text-terracotta-600 border-terracotta-600/30',
  };

  const normalize = v => v?.toString().toLowerCase().replace(/_/g, '-') || '';

  const [form, setForm] = useState({
    orderedDate: item.orderedDate || '',
    leadTime: item.leadTime || '',
    delivery_status: normalize(item.delivery_status),
    eta: item.eta || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef(null);

  const formRef = useRef(form);

  // Sync props to local state
  useEffect(() => {
    setForm({
      orderedDate: item.orderedDate || '',
      leadTime: item.leadTime || '',
      delivery_status: normalize(item.delivery_status),
      eta: item.eta || '',
    });
  }, [item]);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  // Update local state (no saving)
  const updateLocal = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const saveChanges = () => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const currentForm = formRef.current;

      const { matchedProduct, ...updatedProduct } = {
        ...item,
        ...currentForm,
      };

      setIsSaving(true);
      handleChangeLogistics(updatedProduct, room.id, () => {
        setIsSaving(false);
      });
    }, 500);
  };

  // **FIX 4: Restore onBlur handler**
  // This will call saveChanges only when the user clicks away.
  const handleBlur = () => saveChanges();

  // This handler updates state *and* triggers the save
  const handleStatusChange = value => {
    const normalized = normalize(value);
    // We still call updateLocal to update the UI instantly
    updateLocal('delivery_status', normalized);
    // Then call saveChanges, which will read the latest state from the ref
    saveChanges();
  };

  const pillColor = colors[normalize(form.delivery_status)] || defaultColor;

  // SIMPLE PILL (no PO number)
  if (!item?.xeroPoNumber) {
    const status = normalize(item.delivery_status);

    return (
      <span
        className={cn(
          'inline-flex items-center rounded-md border h-6 px-2 text-xs font-medium whitespace-nowrap',
          colors[status] || defaultColor
        )}
      >
        {labels[status] || 'Not ordered'}
      </span>
    );
  }

  // FULL EDITABLE VERSION
  return (
    <div className="flex items-start gap-6 relative">
      {isSaving && <Loader2 className="animate-spin w-3 h-3 absolute -right-4 top-1.5 text-slatex-600" />}

      {/* LEFT SIDE */}
      <div className="flex flex-col gap-1 flex-1 text-neutral-700">
        {/* Ordered date */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm">Ordered:</span>
          <Input
            value={form.orderedDate}
            onChange={e => updateLocal('orderedDate', e.target.value)}
            onBlur={handleBlur} // **RESTORED**
            className="h-6 w-16 text-xs px-1.5 py-0"
          />
        </div>

        {/* Lead time */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm">Lead:</span>
          <Input
            value={form.leadTime}
            onChange={e => updateLocal('leadTime', e.target.value)}
            onBlur={handleBlur} // **RESTORED**
            className="h-6 w-16 text-xs px-1.5 py-0"
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col gap-1 items-center">
        {/* Status dropdown */}
        <Select value={form.delivery_status} onValueChange={handleStatusChange}>
          <SelectTrigger className={cn('h-6 px-2 text-xs rounded-md border', pillColor)}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            {Object.entries(labels).map(([key, name]) => (
              <SelectItem key={key} value={key}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* ETA */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm">ETA:</span>
          <Input
            value={form.eta}
            onChange={e => updateLocal('eta', e.target.value)}
            onBlur={handleBlur} // **RESTORED**
            className="h-6 w-16 text-xs px-1.5 py-0"
          />
        </div>
      </div>
    </div>
  );
}
