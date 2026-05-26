'use client';

import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { WorkUpdateModal } from './WorkUpdateModal';
import { WorkUpdateCard } from './WorkUpdateCard';
import { getUserWorkUpdates } from '@/actions/workUpdateActions';
import { useStore } from '@/store/useStore';

export function DailyTaskUpdater() {
  const currentUser = useStore((state) => state.currentUser);
  const [workUpdates, setWorkUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadWorkUpdates();
  }, []);

  const loadWorkUpdates = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const result = await getUserWorkUpdates(currentUser.id, 100);
      if (result.success) {
        setWorkUpdates(result.workUpdates || []);
      }
    } catch (error) {
      console.error('Failed to load work updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayUpdates = workUpdates.filter(update => {
    const updateDate = new Date(update.date).toISOString().split('T')[0];
    return updateDate === new Date().toISOString().split('T')[0];
  });

  const getTodaysSummary = () => {
    const totalHours = todayUpdates.reduce((sum, u) => sum + (u.hoursSpent || 0), 0);
    const totalProgress = todayUpdates.reduce((sum, u) => sum + (u.progressAdded || 0), 0);
    return { totalHours, totalProgress };
  };

  const { totalHours, totalProgress } = getTodaysSummary();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Daily Work Updates</h2>
          <p className="text-sm text-[var(--muted)] mt-1">Track your daily progress and work completion</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          <span>Add Update</span>
        </button>
      </div>

      {/* Today's Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-4">
          <p className="text-sm text-[var(--muted)] mb-2">Today's Updates</p>
          <p className="text-3xl font-bold text-[var(--foreground)]">{todayUpdates.length}</p>
        </div>
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-4">
          <p className="text-sm text-[var(--muted)] mb-2">Hours Logged</p>
          <p className="text-3xl font-bold text-[var(--accent)]">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-4">
          <p className="text-sm text-[var(--muted)] mb-2">Progress Added</p>
          <p className="text-3xl font-bold text-green-500">{totalProgress}%</p>
        </div>
      </div>

      {/* Today's Updates */}
      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border-color)] p-4">
          <h3 className="font-semibold text-[var(--foreground)]">Today's Work</h3>
        </div>
        <div className="divide-y divide-[var(--border-color)]">
          {loading ? (
            <div className="p-6 text-center text-[var(--muted)]">Loading...</div>
          ) : todayUpdates.length === 0 ? (
            <div className="p-6 text-center text-[var(--muted)]">
              <p>No work updates yet today</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-3 text-[var(--accent)] hover:underline text-sm"
              >
                Add your first update
              </button>
            </div>
          ) : (
            todayUpdates.map(update => (
              <WorkUpdateCard
                key={update.id}
                update={update}
                onRefresh={loadWorkUpdates}
              />
            ))
          )}
        </div>
      </div>

      {/* Recent Updates */}
      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border-color)] p-4">
          <h3 className="font-semibold text-[var(--foreground)]">Recent Updates</h3>
        </div>
        <div className="divide-y divide-[var(--border-color)]">
          {loading ? (
            <div className="p-6 text-center text-[var(--muted)]">Loading...</div>
          ) : workUpdates.length === 0 ? (
            <div className="p-6 text-center text-[var(--muted)]">No work updates yet</div>
          ) : (
            workUpdates.slice(0, 10).map(update => (
              <WorkUpdateCard
                key={update.id}
                update={update}
                onRefresh={loadWorkUpdates}
              />
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <WorkUpdateModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={loadWorkUpdates}
        />
      )}
    </div>
  );
}
