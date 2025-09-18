import { Bell, ListTodo, MessageSquareText, UserRoundCheck } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'; // Update import path
import useUser from '@/hooks/useUser';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { deleteNotification, fetchOnlyProject } from '@/supabase/API';
import Link from 'next/link';
import useNotification from '@/hooks/useNotification';
import useTask from '@/supabase/hook/useTask';
import { TaskModal } from '../tasks/task-modal';

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const dayName = date.toLocaleDateString(undefined, { weekday: 'long' });
  const timeString = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `${dayName} ${timeString}`;
}

function timeAgo(timestamp) {
  const now = Date.now();
  const diffMs = now - timestamp;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
}

export const NotificationButton = () => {
  // const { notification, unreadCount, isLoading, handleUnread } = useNotification();
  const { notification, unreadCount, isLoading: notificationLoading, handleUnread, refetch } = useNotification();
  const { user } = useUser();
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: taskData, isLoading: taskLoading } = useTask();
  const [currentNotification, setCurrentNotification] = useState(null);
  const [open, setOpen] = useState(false);

  // Projects
  const { data: project, isLoading: ProjectLoading } = useQuery({
    queryKey: ['fetchOnlyProject'],
    queryFn: () => fetchOnlyProject({ projectID: null }),
  });

  //   delete
  const { mutate } = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      refetch();
    },
  });

  //   delete notificaion
  const handleDelete = item => {
    mutate({ email: user?.email, notificationId: item.id });
  };

  // // Mark as read
  // const { mutate } = useMutation({
  //   mutationFn: markNotificationAsRead,
  // });

  // // handle unread
  // const handleUnread = notification => {
  //   if (!notification.isRead) {
  //     mutate({ email: user?.email, notificationId: notification.id });
  //   }
  // };

  function openModal(id) {
    setModalOpen(true);
    setSelectedTask(taskData?.data?.find(item => item.id == id));
  }

  function afterOpenModal() {}

  function closeModal() {
    setSelectedTask(null);
    setModalOpen(false);
    handleDelete(currentNotification);
  }

  // Subscribe to Notification
  // useEffect(() => {
  //   if (!user?.email) return;

  //   // Initial fetch of notifications
  //   fetchNotifications(user.email).then(setNotification);

  //   // Subscribe to real-time notifications
  //   const subscription = subscribeToNotifications(user.email, newNotifications => {
  //     setNotification(prevNotifications => {
  //       const updatedNotifications = Array.isArray(newNotifications) ? newNotifications : [newNotifications];

  //       // Show toast for the most recent notification
  //       const mostRecentNotification = updatedNotifications[updatedNotifications.length - 1];

  //       // Display toast with the notification message
  //       // toast(`${mostRecentNotification?.title || 'New notification received'}`, {
  //       //   duration: 5000,
  //       // });
  //       // Update state while handling duplicates
  //       return updatedNotifications.reduce((acc, newNotification) => {
  //         const exists = acc.some(notif => notif.id === newNotification.id);
  //         if (exists) {
  //           return acc.map(notif => (notif.id === newNotification.id ? newNotification : notif));
  //         } else {
  //           return [...acc, newNotification];
  //         }
  //       }, prevNotifications);
  //     });
  //   });

  //   return () => {
  //     supabase.removeChannel(subscription);
  //   };
  // }, [user?.email]);

  // useEffect(() => {
  //   setUnreadCount(notification?.filter(item => item.isRead == false));
  // }, [notification, data]);

  // useEffect(() => {
  //   if (isLoading) return;
  //   setNotification(data);
  //   setUnreadCount(data?.filter(item => item.isRead == false));
  // }, [isLoading, data, user?.email]);

  // const handleMarkUnread = notification => {
  //   handleUnread(notification);
  // };

  const handleClickNotification = (item, id) => {
    openModal(id);
    setCurrentNotification(item);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {/* <button
            type="button"
            className="inline-flex shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)] duration-300 hover:bg-black hover:text-white items-center p-2 rounded-[10px]  text-gray-900 bg-white focus:outline-none"
          >
            <span className="relative">
              <Bell strokeWidth={1.5} />
              {!notificationLoading && unreadCount?.length > 0 && (
                <span className=" absolute -top-[3px]  right-0 font-semibold  w-[14px] h-[14px] text-[11px] rounded-full bg-[#E62323] text-white flex items-center justify-center">
                  {unreadCount.length}
                </span>
              )}
            </span>
          </button> */}

          <button
            className="bg-neutral-50 hover:bg-neutral-100 text-ink focus-visible:ring-neutral-300 w-11 h-11 flex items-center justify-center rounded-[12px] transition-all duration-200 relative focus-visible:outline-none focus-visible:ring-2  "
            aria-label="Notifications"
          >
            {/* <Bell /> */}
            {/* <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-clay-500" /> */}
            <span className="relative">
              <Bell className="w-5 h-5 stroke-[1.75]" />
              {!notificationLoading && unreadCount?.length > 0 && (
                <span className=" absolute -top-[3px]  right-0 font-semibold  w-[14px] h-[14px] text-[11px] rounded-full bg-[#E62323] text-white flex items-center justify-center">
                  {unreadCount.length}
                </span>
              )}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" alignOffset={-40} className="w-[420px] mt-2 rounded-xl bg-white p-0">
          <div className="flex flex-col items-start gap-1 p-5 border-b">
            <p className="text-sm font-semibold text-gray-900">
              Notifications
              {!notificationLoading && unreadCount?.length > 0 && (
                <Badge className="ml-2 px-2 py-1 " variant="secondary">
                  {!notificationLoading && unreadCount?.length}
                </Badge>
              )}
            </p>
            {!notificationLoading && unreadCount?.length > 0 && <p className="text-[12px] text-gray-700">You have a new notification!</p>}
          </div>

          <div className="max-h-[60vh]  overflow-y-auto">
            {!notificationLoading &&
              notification?.length > 0 &&
              notification.map((item, index) => (
                <div
                  onClick={() => {
                    handleClickNotification(item, item?.itemID);
                  }}
                  key={index}
                  className="flex  relative border-b border-black/5 cursor-pointer flex-col items-start gap-1 px-3 py-5 hover:bg-gray-50"
                >
                  {item.type == 'task' && (
                    <div className="flex  w-full gap-3">
                      <div className="bg-gray-200 mt-1 flex-shrink-0 text-gray-600 text-[17px] font-semibold w-9 h-9 rounded-full flex items-center justify-center">
                        {item?.creator?.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-500  mb-1.5 font-medium justify-between  text-sm flex flex-wrap items-center gap-1.5">
                          <span className=" font-semibold text-black">
                            {item?.creator?.name?.split(' ')[0]} <span className="font-normal">assigned you</span>{' '}
                          </span>
                          <span
                            title={item?.title}
                            className="capitalize border rounded-lg flex items-center gap-1 ml-1 py-1 px-2 font-medium text-black"
                          >
                            <UserRoundCheck className="flex-shrink-0" strokeWidth={2} size={15} color="green" />
                            <span className=" max-w-[90px] truncate"> {item?.title}</span>
                          </span>
                        </p>
                        <p className="text-[12px] font-medium text-gray-500 flex items-center justify-between">
                          <span>{formatTimestamp(item.timestamp)}</span>
                          <span>{timeAgo(item.timestamp)}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {item.type == 'subtask' && (
                    <div className="flex  w-full gap-3">
                      <div className="bg-gray-200 mt-1 flex-shrink-0 text-gray-600 text-[17px] font-semibold w-9 h-9 rounded-full flex items-center justify-center">
                        {item?.creator?.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-500 justify-between  mb-1.5 flex items-center gap-1.5 font-medium text-sm">
                          <span className=" font-semibold  text-black">
                            {item?.creator?.name?.split(' ')[0]} <span className="font-normal">mentioned you in</span>
                          </span>{' '}
                          <span
                            title={item?.message}
                            className="capitalize border rounded-lg flex items-center gap-1 ml-1 py-1 px-2 font-medium text-black"
                          >
                            <ListTodo className="flex-shrink-0" strokeWidth={2} size={15} color="orange" />
                            <span className=" max-w-[90px] truncate"> {item?.message}</span>
                          </span>
                        </p>
                        <p className="text-[12px] font-medium text-gray-500 flex items-center justify-between">
                          <span>{formatTimestamp(item.timestamp)}</span>
                          <span>{timeAgo(item.timestamp)}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {item.type == 'comment' && (
                    <div className="flex max-w-full  w-full gap-3">
                      <div className="bg-gray-200 mt-1 flex-shrink-0 text-gray-600 text-[17px] font-semibold w-9 h-9 rounded-full flex items-center justify-center">
                        {item?.creator?.name[0]}
                      </div>
                      <div className="flex-1 overflow-hidden max-w-full w-full">
                        <p className="text-gray-500 justify-between flex items-center gap-1.5 mb-1.5 font-medium text-sm">
                          <span className=" font-semibold text-black">
                            {item?.creator?.name?.split(' ')[0]} <span className="font-normal">mentioned you in</span>{' '}
                          </span>
                          <span
                            title={item?.title}
                            className="capitalize truncate border rounded-lg flex items-center gap-1 ml-1 py-1 px-2 font-medium text-black"
                          >
                            <MessageSquareText className="flex-shrink-0" strokeWidth={2} size={15} color="blue" />
                            <span className=" max-w-[90px] truncate"> {item?.title}</span>
                          </span>
                        </p>
                        <p className="text-[12px] font-medium text-gray-500 flex items-center justify-between">
                          <span>{formatTimestamp(item.timestamp)}</span>
                          <span>{timeAgo(item.timestamp)}</span>
                        </p>
                        <div className="border max-w-full w-full truncate overflow-hidden rounded-lg bg-gray-100 text-[13px] mt-3 text-black  p-3">
                          {item?.message}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* <p className="text-sm text-gray-700">{item.title}</p> */}
                  {!item.isRead && <span className=" w-2 h-2 bg-blue-600 rounded-full absolute top-2 right-3"></span>}
                </div>
              ))}

            {!notificationLoading && notification?.length === 0 && (
              <div className="p-3 text-center">
                <p className="text-sm text-gray-500">No notifications</p>
              </div>
            )}

            {notificationLoading && (
              <div className="p-3 text-center">
                <p className="text-sm text-gray-500">Loading notifications...</p>
              </div>
            )}
          </div>
          <Link href={'#'} className="text-xs block duration-200 hover:bg-gray-100 text-center w-full py-3 border-t">
            All Notification
          </Link>
        </PopoverContent>
      </Popover>

      {/* Modal */}
      {/* <NewTaskDrawar
        // projectId={null}
        closeModal={closeModal}
        afterOpenModal={afterOpenModal}
        modalOpen={modalOpen}
        project={project}
        task={selectedTask}
      /> */}

      <TaskModal
        open={modalOpen}
        onOpenChange={closeModal}
        projectId={null}
        team={null}
        defaultListId={null}
        taskToEdit={selectedTask}
        // onSave={handleSave}
        // setEditing={setEditing}
        // openDeleteModal={openDeleteModal}
      />
    </>
  );
};

export default NotificationButton;
