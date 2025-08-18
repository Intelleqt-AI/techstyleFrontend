'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import { getUsers } from '../API';

const useUser = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // Fetch Supabase session
  useEffect(() => {
    const fetchSession = async () => {
      setIsSessionLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error.message);
        setUserEmail(null);
      } else {
        setUserEmail(data?.session?.user?.email || null);
      }
      setIsSessionLoading(false);
    };
    fetchSession();
  }, []);

  // Fetch users (only when email exists)
  const {
    data: users,
    isLoading: isUsersLoading,
    error,
  } = useQuery({
    queryKey: ['users', userEmail],
    queryFn: getUsers,
    enabled: !!userEmail,
    staleTime: 1000 * 60 * 5,
  });

  const currentUser = users?.data?.find((user: any) => user.email === userEmail);

  const isLoading = isSessionLoading || isUsersLoading;

  return {
    user: isLoading ? null : { email: userEmail, name: currentUser?.name },
    isLoading,
    error,
  };
};

export default useUser;
