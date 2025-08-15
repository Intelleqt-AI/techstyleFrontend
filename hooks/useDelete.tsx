import { deleteData } from '@/lib/Api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useDeleteData = (options = {}) => {
  return useMutation({
    mutationFn: deleteData,
    ...options,
  });
};

export default useDeleteData;
