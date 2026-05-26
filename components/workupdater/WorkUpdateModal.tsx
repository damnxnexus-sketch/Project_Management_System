'use client';

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createWorkUpdate } from '@/actions/workUpdateActions';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface WorkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskId?: string;
}

export function WorkUpdateModal({ isOpen, onClose, onSuccess, taskId }: WorkUpdateModalProps) {
  const currentUser = useStore((state) => state.currentUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    workDone: '',
    hoursSpent: '',
    progressAdded: '0',
    status: '',
    priority: '',
    blockers: '',
    nextSteps: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.workDone.trim()) {
      toast.error('Please describe your work');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createWorkUpdate({
        taskId,
        workDone: formData.workDone,
        hoursSpent: formData.hoursSpent ? parseFloat(formData.hoursSpent) : undefined,
        progressAdded: parseInt(formData.progressAdded) || 0,
        status: formData.status || undefined,
        priority: formData.priority || undefined,
        blockers: formData.blockers || undefined,
        nextSteps: formData.nextSteps || undefined,
      });

      if (result.success) {
        toast.success('Work update saved successfully!');
        setFormData({
          workDone: '',
          hoursSpent: '',
          progressAdded: '0',
          status: '',
          priority: '',
          blockers: '',
          nextSteps: '',
        });
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || 'Failed to save work update');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save work update');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border-color)] bg-[var(--background)] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Daily Work Update</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Work Done */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Work Completed <span className="text-red-500">*</span>
            </label>
            <textarea
              name="workDone"
              value={formData.workDone}
              onChange={handleChange}
              placeholder="Describe what you accomplished today... Be specific about tasks, features, bugs fixed, etc."
              rows={5}
              className="w-full px-4 py-3 bg-[var(--surface-raised)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hours Spent */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">Hours Spent</label>
              <input
                type="number"
                name="hoursSpent"
                value={formData.hoursSpent}
                onChange={handleChange}
                placeholder="e.g., 2.5"
                step="0.5"
                min="0"
                max="24"
                className="w-full px-4 py-2 bg-[var(--surface-raised)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            {/* Progress Added */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">Progress Added (%)</label>
              <input
                type="number"
                name="progressAdded"
                value={formData.progressAdded}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="100"
                className="w-full px-4 py-2 bg-[var(--surface-raised)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[var(--surface-raised)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="">No change</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground)]">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-[var(--surface-raised)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="">No change</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Blockers */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">Blockers/Challenges</label>
            <textarea
              name="blockers"
              value={formData.blockers}
              onChange={handleChange}
              placeholder="Any blockers or challenges encountered?"
              rows={3}
              className="w-full px-4 py-3 bg-[var(--surface-raised)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
            />
          </div>

          {/* Next Steps */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">Next Steps/Plans</label>
            <textarea
              name="nextSteps"
              value={formData.nextSteps}
              onChange={handleChange}
              placeholder="What are you planning to do next?"
              rows={3}
              className="w-full px-4 py-3 bg-[var(--surface-raised)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end border-t border-[var(--border-color)] pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 text-[var(--foreground)] bg-[var(--surface-raised)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--surface)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Update'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
