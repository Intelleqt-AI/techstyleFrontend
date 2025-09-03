import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import useUser from './useUser';
import { getCurrency } from '@/supabase/API';

export function useCurrency() {
  const { user, isLoading: userLoading } = useUser();
  const email = user?.email || null;

  const [currency, setCurrency] = useState(() => {
    const item = localStorage.getItem('studioCurrency');
    return item ? JSON.parse(item) : null;
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['studioCurrency', email],
    queryFn: () => getCurrency(email!),
    enabled: !!email && !currency,
  });

  return {
    currency: currency || data || null,
    isLoading: isLoading || userLoading,
    isError,
  };
}
