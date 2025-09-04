'use client';

import { Section } from '@/components/settings/section';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import useUser from '@/hooks/useUser';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser } from '@/supabase/API';
import { toast } from 'sonner';
import { CurrencySelector } from '@/components/ui/CurrencySelector';

export default function StudioFinancePage() {
  const { user, isLoading } = useUser();
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isLoading) return;
    setCurrentUser(user);
  }, [user?.email, isLoading]);

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      console.log(currentUser?.studioCurrency);
      localStorage.setItem('studioCurrency', JSON.stringify(currentUser?.studioCurrency));
      queryClient.invalidateQueries(['users', user?.email]);
      toast.success('Profile Updated');
    },
    onError: error => {
      console.log(error);
      toast('Error! Try again');
    },
  });

  const handleUpdate = e => {
    const { name, value } = e.target;
    console.log(name, value);
    setCurrentUser(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateCurrency = e => {
    setCurrentUser(prev => ({
      ...prev,
      studioCurrency: e.currency,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(currentUser);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Finance</h1>
        <p className="text-sm text-gray-600">Currency, tax, invoice numbering, and payment terms.</p>
      </div>

      <Section title="Defaults" description="Set your studio-wide financial defaults.">
        <form onSubmit={e => handleSubmit(e)} className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="taxRate">Default studio currency</Label>
            <CurrencySelector value={currentUser?.studioCurrency} onChange={handleUpdateCurrency} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxRate">Default tax rate (%)</Label>
            <Input
              value={currentUser?.studioTexRate}
              onChange={value => {
                const e = {
                  target: {
                    name: 'studioTexRate',
                    value: value.target.value,
                  },
                };
                handleUpdate(e);
              }}
              id="taxRate"
              name="taxRate"
              type="number"
              step="0.01"
              defaultValue={8.875}
            />
          </div>
          {/* 
          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">Invoice prefix</Label>
            <Input id="invoicePrefix" name="invoicePrefix" placeholder="TS-" defaultValue="TS-" />
          </div> */}

          {/* <div className="space-y-2">
            <Label htmlFor="nextInvoice">Next invoice number</Label>
            <Input id="nextInvoice" name="nextInvoice" type="number" defaultValue={1024} />
          </div> */}
          {/* 
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Payment terms (days)</Label>
            <Input id="paymentTerms" name="paymentTerms" type="number" defaultValue={30} />
          </div> */}

          <div className="sm:col-span-2 flex justify-end">
            <Button>Save finance settings</Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
