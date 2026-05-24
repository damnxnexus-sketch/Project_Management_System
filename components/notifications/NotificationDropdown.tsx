'use client';

import { NotificationItem } from './NotificationItem';
import { Spinner } from '@/components/ui/Spinner';
import { markAllNotificationsAsRead } from '@/actions/notificationActions';
import { CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  taskId: string | null;
  read: boolean;
  createdAt: Date;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  isLoading: boolean;
  onClose: () => void;
  onNotificationRead: () => void;
  userId: string;
}

export function NotificationDropdown({
  notifications,
  isLoading,
  onClose,
  onNotificationRead,
  userId,
}: NotificationDropdownProps) {
  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead(userId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('All notifications marked as read');
        onNotificationRead();
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute right-0 top-full mt-2 w-96 max-h-[600px] overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--surface)] shadow-2xl z-50">
      <div className="sticky top-0 bg-[var(--surface)] border-b border-[var(--border-color)] p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-xs text-[var(--accent)] hover:text-[var(--accent)]/80 font-medium"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto max-h-[500px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-[var(--muted)]">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={onNotificationRead}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
