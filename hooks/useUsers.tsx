import { getUsers } from '@/supabase/API';
import { useQuery } from '@tanstack/react-query';

const useUsers = () => {
  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 1000 * 60 * 5,
  });

  return {
    users,
    isLoading,
    refetch,
  };
};

export default useUsers;
