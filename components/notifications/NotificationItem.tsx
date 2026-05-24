'use client';

import { useState } from 'react';
import { X, MessageSquare, UserPlus, Edit, AtSign } from 'lucide-react';
import { markNotificationAsRead, deleteNotification } from '@/actions/notificationActions';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  taskId: string | null;
  read: boolean;
  createdAt: Date;
}

interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
  onClose: () => void;
}

export function NotificationItem({ notification, onRead, onClose }: NotificationItemProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const getIcon = () => {
    switch (notification.type) {
      case 'task_assigned':
        return <UserPlus size={16} className="text-blue-500" />;
      case 'task_updated':
        return <Edit size={16} className="text-amber-500" />;
      case 'mentioned':
        return <AtSign size={16} className="text-purple-500" />;
      case 'comment':
        return <MessageSquare size={16} className="text-green-500" />;
      default:
        return <MessageSquare size={16} className="text-[var(--muted)]" />;
    }
  };

  const handleClick = async () => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      onRead();
    }
    
    // Navigate to task if taskId exists
    if (notification.taskId) {
      onClose();
      router.push(`/?taskId=${notification.taskId}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const result = await deleteNotification(notification.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        onRead();
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group relative p-4 cursor-pointer transition-colors hover:bg-[var(--surface-raised)]
        ${!notification.read ? 'bg-[var(--accent)]/5' : ''}
      `}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--foreground)] mb-1">
                {notification.title}
              </p>
              <p className="text-xs text-[var(--muted)] line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-[var(--muted)] mt-2">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--muted)] hover:text-red-500 disabled:opacity-50"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {!notification.read && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--accent)]" />
      )}
    </div>
  );
}
