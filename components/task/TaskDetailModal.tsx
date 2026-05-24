'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { getTaskById } from '@/actions/taskDetailActions';
import { getTaskActivityLogs } from '@/actions/auditActions';
import { Spinner } from '@/components/ui/Spinner';
import { TaskDetailTabs } from './TaskDetailTabs';
import { TaskHeader } from './TaskHeader';
import toast from 'react-hot-toast';

interface TaskDetailModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserRole: string;
}

export function TaskDetailModal({ 
  taskId, 
  isOpen, 
  onClose, 
  currentUserId,
  currentUserRole 
}: TaskDetailModalProps) {
  const [task, setTask] = useState<any>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && taskId) {
      loadTaskData();
    }
  }, [isOpen, taskId]);

  const loadTaskData = async () => {
    setIsLoading(true);
    try {
      const [taskResult, logsResult] = await Promise.all([
        getTaskById(taskId),
        getTaskActivityLogs(taskId),
      ]);

      if (taskResult.error) {
        toast.error(taskResult.error);
        onClose();
      } else if (taskResult.success && taskResult.task) {
        setTask(taskResult.task);
      }

      if (logsResult.success && logsResult.logs) {
        setActivityLogs(logsResult.logs);
      }
    } catch (error) {
      console.error('Failed to load task:', error);
      toast.error('Failed to load task details');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskUpdate = (updatedTask: any) => {
    setTask(updatedTask);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="" 
      size="large"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : task ? (
        <div className="space-y-6">
          <TaskHeader 
            task={task} 
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            onUpdate={handleTaskUpdate}
            onClose={onClose}
          />
          
          <TaskDetailTabs
            task={task}
            activityLogs={activityLogs}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
          />
        </div>
      ) : (
        <div className="text-center py-8 text-[var(--muted)]">
          Task not found
        </div>
      )}
    </Modal>
  );
}
