import { useMemo } from 'react';
import useUser from './useUser';

export function useAdmin() {
  const { user, isLoading: userLoading } = useUser();

  const admins = [
    // 'david.zeeman@intelleqt.ai',
    'roxi.zeeman@souqdesign.co.uk',
    'risalat.shahriar@intelleqt.ai',
    'dev@intelleqt.ai',
    'saif@intelleqt.ai',
  ];

  const isAdmin = useMemo(() => {
    if (userLoading) return false;
    return admins.includes(user?.email ?? '');
  }, [user, userLoading]);

  return {
    isAdmin,
    user,
    userLoading,
  };
}
