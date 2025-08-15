import { fetchData } from '@/lib/Api';
import { useQuery } from '@tanstack/react-query';

const useFetch = (url, options = {}) => {
  const { data, isLoading, error, isError, refetch, isPending } = useQuery({
    queryKey: [url],
    queryFn: () => fetchData(url),
    enabled: options.enabled !== false,
    ...options,
  });

  return {
    data,
    isLoading,
    error,
    isError,
    refetch,
    isPending,
  };
};

export default useFetch;
