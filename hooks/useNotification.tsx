import React, { useEffect, useState } from 'react';
import useUser from './useUser';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchNotifications, markNotificationAsRead, subscribeToNotifications } from '@/supabase/API';
import supabase from '@/supabase/supabaseClient';

const useNotification = () => {
  const { user } = useUser();
  const [notification, setNotification] = useState([]);
  const [unreadCount, setUnreadCount] = useState([]);

  // Mark as read
  const { mutate } = useMutation({
    mutationFn: markNotificationAsRead,
  });

  // handle unread
  const handleUnread = notification => {
    if (!notification.isRead) {
      mutate({ email: user?.email, notificationId: notification.id });
    }
  };

  // Subscribe to Notification
  useEffect(() => {
    if (!user?.email) return;

    // Initial fetch of notifications
    fetchNotifications(user.email).then(setNotification);

    // Subscribe to real-time notifications
    const subscription = subscribeToNotifications(user.email, newNotifications => {
      setNotification(prevNotifications => {
        const updatedNotifications = Array.isArray(newNotifications) ? newNotifications : [newNotifications];
        // Update state while handling duplicates
        return updatedNotifications.reduce((acc, newNotification) => {
          const exists = acc.some(notif => notif.id === newNotification.id);
          if (exists) {
            return acc.map(notif => (notif.id === newNotification.id ? newNotification : notif));
          } else {
            return [...acc, newNotification];
          }
        }, prevNotifications);
      });
    });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.email]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['getNotification', user?.email],
    queryFn: () => fetchNotifications(user?.email),
    enabled: !!user?.email,
  });

  useEffect(() => {
    setUnreadCount(notification?.filter(item => item.isRead == false));
  }, [notification, data]);

  useEffect(() => {
    if (isLoading) return;
    setNotification(data?.filter(item => item?.creator?.email !== user.email).sort((a, b) => b.timestamp - a.timestamp));
    setUnreadCount(data?.filter(item => item.isRead == false));
  }, [isLoading, data, user?.email]);

  return { notification, unreadCount, isLoading, handleUnread, refetch };
};

export default useNotification;
