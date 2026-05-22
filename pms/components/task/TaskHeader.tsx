'use client';

import { useState } from 'react';
import { X, Trash2, Calendar, User, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { deleteTask } from '@/actions/taskActions';
import { updateTask } from '@/actions/taskDetailActions';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface TaskHeaderProps {
  task: any;
  currentUserId: string;
  currentUserRole: string;
  onUpdate: (task: any) => void;
  onClose: () => void;
}

export function TaskHeader({ task, currentUserId, currentUserRole, onUpdate, onClose }: TaskHeaderProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);

  const canDelete = currentUserRole === 'Master Admin' || currentUserRole === 'Admin';
  const canEdit = currentUserRole !== 'Worker' || task.assigneeId === currentUserId;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteTask(task.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Task deleted');
        onClose();
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSave = async () => {
    try {
      const result = await updateTask(task.id, {
        title: editedTitle,
        description: editedDescription,
      });
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.success && result.task) {
        onUpdate(result.task);
        setIsEditing(false);
        toast.success('Task updated');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    }
  };

  const priorityColors = {
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    high: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const statusColors = {
    todo: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    'in-progress': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'in-review': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    done: 'bg-green-500/10 text-green-500 border-green-500/20',
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full text-2xl font-bold bg-[var(--surface-raised)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            ) : (
              <h2 className="text-2xl font-bold text-[var(--foreground)]">{task.title}</h2>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                <Flag size={12} className="mr-1" />
                {task.priority.toUpperCase()}
              </Badge>
              
              <Badge className={statusColors[task.status as keyof typeof statusColors]}>
                {task.status.replace('-', ' ').toUpperCase()}
              </Badge>
              
              {task.aiRisk && (
                <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                  ⚠️ HIGH RISK
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            {canEdit && (
              <>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:opacity-90"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditedTitle(task.title);
                        setEditedDescription(task.description);
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 bg-[var(--surface-raised)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--surface)]"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-[var(--surface-raised)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--surface)]"
                  >
                    Edit
                  </button>
                )}
              </>
            )}
            
            {canDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-[var(--muted)] hover:text-red-500 hover:bg-[var(--surface-raised)] rounded-lg transition-colors"
                title="Delete task"
              >
                <Trash2 size={18} />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)] rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {isEditing ? (
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            rows={4}
            className="w-full bg-[var(--surface-raised)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
          />
        ) : (
          <p className="text-[var(--muted)]">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm">
          {task.assignee && (
            <div className="flex items-center gap-2">
              <User size={16} className="text-[var(--muted)]" />
              <Avatar src={task.assignee.avatar || undefined} alt={task.assignee.name} size="sm" />
              <span className="text-[var(--foreground)]">{task.assignee.name}</span>
            </div>
          )}
          
          {task.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[var(--muted)]" />
              <span className="text-[var(--foreground)]">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {task.project && (
            <div className="flex items-center gap-2">
              <span className="text-[var(--muted)]">Project:</span>
              <span className="text-[var(--foreground)] font-medium">{task.project.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--muted)]">Progress:</span>
          <div className="flex-1 h-2 bg-[var(--surface-raised)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-[var(--foreground)]">{task.progress}%</span>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This will also delete all comments, attachments, and activity logs. This action cannot be undone."
        confirmText="Delete Task"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
