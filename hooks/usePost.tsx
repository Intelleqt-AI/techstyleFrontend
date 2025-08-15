// hooks/useModifyTask.ts
import { postData } from '@/lib/Api';
import { useMutation } from '@tanstack/react-query';

export const usePost = () => {
  return useMutation({
    mutationFn: postData,
  });
};
