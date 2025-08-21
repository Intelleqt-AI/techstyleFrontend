import { getSupplier } from "@/supabase/API";
import { useQuery } from "@tanstack/react-query";

const useSupplier = () => {
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["supplier"],
    queryFn: getSupplier,
  });

  return { data, isLoading, error, refetch };
};

export default useSupplier;
