import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '../API';

const useProjects = () => {
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchProjects(),
  });

  return { data, isLoading, error, refetch };
};

export default useProjects;
