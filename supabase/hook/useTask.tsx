import { useQuery } from '@tanstack/react-query';
import { getTask } from '../API';

const useTask = () => {
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['task'],
    queryFn: getTask,
  });

  return { data, isLoading, error, refetch };
};

export default useTask;
