'use client';

import React, { useState } from 'react';
import { Task, Comment as PrismaComment, Attachment, User, Project } from '@prisma/client';
import { CommentSection } from '@/components/comments/CommentSection';
import { AttachmentSection } from '@/components/attachments/AttachmentSection';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { deleteTask } from '@/actions/taskActions';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';

interface TaskWithRelations extends Task {
  assignee: User | null;
  project: Project | null;
  comments: (PrismaComment & {
    author: User;
    mentions: Array<{ user: User }>;
  })[];
  attachments: Attachment[];
}

interface Props {
  task: TaskWithRelations;
  currentUserId: string;
}

const statusColors: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'in-review': 'bg-purple-100 text-purple-800',
  done: 'bg-green-100 text-green-800',
};

const priorityColors: Record<string, string> = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
};

export default function TaskDetailClient({ task, currentUserId }: Props) {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments' | 'activity'>('details');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      toast.success('Task deleted successfully');
      router.push('/');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Back
        </Link>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition"
          title="Delete task"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Task Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">{task.title}</h1>

        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <span className="text-sm text-gray-600">Status</span>
            <p className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status]}`}>
              {task.status.replace('-', ' ')}
            </p>
          </div>

          <div>
            <span className="text-sm text-gray-600">Priority</span>
            <p className={`text-lg font-semibold ${priorityColors[task.priority]}`}>{task.priority}</p>
          </div>

          <div>
            <span className="text-sm text-gray-600">Progress</span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${task.progress}%` }}></div>
            </div>
            <p className="text-sm font-medium text-gray-700">{task.progress}%</p>
          </div>

          {task.assignee && (
            <div>
              <span className="text-sm text-gray-600">Assigned to</span>
              <p className="text-sm font-medium text-gray-900">{task.assignee.name}</p>
            </div>
          )}

          {task.dueDate && (
            <div>
              <span className="text-sm text-gray-600">Due Date</span>
              <p className="text-sm font-medium text-gray-900">{new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
          )}

          {task.project && (
            <div>
              <span className="text-sm text-gray-600">Project</span>
              <p className="text-sm font-medium text-gray-900">{task.project.name}</p>
            </div>
          )}
        </div>

        {task.description && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        {(['details', 'comments', 'attachments', 'activity'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium transition ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'details' && 'Details'}
            {tab === 'comments' && `Comments (${task.comments.length})`}
            {tab === 'attachments' && `Attachments (${task.attachments.length})`}
            {tab === 'activity' && 'Activity'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeTab === 'details' && (
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Task Information</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-600">Created</dt>
                    <dd className="text-gray-900">{new Date(task.createdAt).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Updated</dt>
                    <dd className="text-gray-900">{new Date(task.updatedAt).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-600">Task ID</dt>
                    <dd className="text-gray-900 font-mono text-xs">{task.id}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-600">Risk Level</dt>
                    <dd className={`font-medium ${task.aiRisk ? 'text-red-600' : 'text-green-600'}`}>
                      {task.aiRisk ? 'High Risk' : 'Low Risk'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <CommentSection
            taskId={task.id}
            initialComments={task.comments.map((c) => ({
              id: c.id,
              content: c.content,
              createdAt: c.createdAt,
              author: {
                id: c.author.id,
                name: c.author.name,
                avatar: null,
              },
              mentions: c.mentions.map((m) => ({
                user: { id: m.user.id, name: m.user.name },
              })),
            }))}
            currentUserId={currentUserId}
          />
        )}

        {activeTab === 'attachments' && (
          <AttachmentSection taskId={task.id} initialAttachments={task.attachments} currentUserId={currentUserId} />
        )}

        {activeTab === 'activity' && <ActivityTimeline logs={[]} />}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onClose={() => setShowDeleteConfirm(false)}
        variant="danger"
      />
    </div>
  );
}
