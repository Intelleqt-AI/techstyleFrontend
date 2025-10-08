import { useMemo } from 'react';
import useUser from './useUser';

export function useAdmin() {
  const { user, isLoading: userLoading } = useUser();

  return {
    isAdmin: user?.isAdmin,
    user,
    userLoading,
  };
}
