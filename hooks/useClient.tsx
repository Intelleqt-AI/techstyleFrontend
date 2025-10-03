import { useQuery } from '@tanstack/react-query';
import { getClient } from '@/supabase/API';

const useClient = () => {
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['client'],
    queryFn: getClient,
  });

  return { data, isLoading, error, refetch };
};

export default useClient;
