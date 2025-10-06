import { getUsers } from "@/supabase/API";
import supabase from "@/supabase/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

const useUser = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // Fetch user session
  useEffect(() => {
    const fetchSession = async () => {
      setIsSessionLoading(true);
      const { data } = await supabase.auth.getSession();
      // console.log(data);
      setUserEmail(data?.session?.user?.email || null);
      setIsSessionLoading(false);
    };
    fetchSession();
  }, []);

  // Fetch users - Only run when we have the email
  const {
    data: users,
    isLoading: isUsersLoading,
    error,
  } = useQuery({
    queryKey: ["users", userEmail],
    queryFn: getUsers,
    staleTime: 1000 * 60 * 5,
    enabled: userEmail !== null,
  });

  const currentUser = users?.data?.find((user) => user.email == userEmail);
  const isLoading = isSessionLoading || isUsersLoading;

  return {
    user: isLoading ? null : { ...currentUser },
    isLoading,
  };
};

export default useUser;
