'use client';

import React, { useEffect, useState } from 'react';
import { getGanttData } from '@/actions/analyticsActions';

interface GanttTask {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
}

interface GanttProject {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  tasks: GanttTask[];
}

const statusColors: Record<string, string> = {
  todo: 'bg-gray-400',
  'in-progress': 'bg-blue-500',
  done: 'bg-green-500',
  blocked: 'bg-red-500',
};

const priorityStyles: Record<string, string> = {
  low: 'border-l-4 border-green-400',
  medium: 'border-l-4 border-yellow-400',
  high: 'border-l-4 border-orange-400',
  critical: 'border-l-4 border-red-500',
};

export default function GanttChart() {
  const [data, setData] = useState<GanttProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const loadGanttData = async () => {
    try {
      setIsLoading(true);
      const result = await getGanttData();
      if (result.success && result.data) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load Gantt data');
      }
    } catch (err) {
      setError('Failed to load Gantt data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGanttData();
  }, []);

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const calculateDaysDiff = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const calculatePosition = (itemStart: string, itemEnd: string, rangeStart: string, rangeEnd: string): { left: number; width: number } => {
    const totalDays = calculateDaysDiff(rangeStart, rangeEnd);
    const itemDays = calculateDaysDiff(itemStart, itemEnd);
    const startOffset = calculateDaysDiff(rangeStart, itemStart);

    const left = (startOffset / totalDays) * 100;
    const width = (itemDays / totalDays) * 100;

    return { left: Math.max(0, left), width: Math.min(100, width) };
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button onClick={loadGanttData} className="mt-2 text-red-600 hover:text-red-800 underline text-sm">
          Try again
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600">No projects with tasks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {data.map((project) => (
            <div key={project.id} className="mb-8">
              {/* Project Header */}
              <div
                className="flex items-center gap-4 p-4 bg-linear-to-r from-purple-50 to-blue-50 rounded-lg cursor-pointer hover:from-purple-100 hover:to-blue-100 transition border border-purple-200"
                onClick={() => toggleProject(project.id)}
              >
                <div className="shrink-0">
                  <svg
                    className={`w-5 h-5 text-purple-600 transition-transform ${expandedProjects.has(project.id) ? 'rotate-90' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="grow">
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-medium text-gray-900">{project.progress}% Progress</div>
                  <div className="w-32 h-2 bg-gray-300 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${project.progress}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Tasks Timeline */}
              {expandedProjects.has(project.id) && project.tasks.length > 0 && (
                <div className="mt-4 ml-8 space-y-3">
                  {/* Timeline Header */}
                  <div className="flex items-start">
                    <div className="w-32 shrink-0"></div>
                    <div className="grow">
                      <div className="grid grid-cols-12 gap-0 text-xs text-gray-500 px-2">
                        {Array.from({ length: 13 }).map((_, i) => (
                          <div key={i} className="text-center">
                            W{i}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tasks */}
                  {project.tasks.map((task) => {
                    const position = calculatePosition(task.startDate, task.endDate, project.startDate, project.endDate);
                    const statusColor = statusColors[task.status] || 'bg-gray-400';

                    return (
                      <div key={task.id} className="flex items-center gap-2">
                        <div className="w-32 shrink-0 overflow-hidden">
                          <div className={`text-sm font-medium text-gray-900 truncate ${priorityStyles[task.priority] || ''}`}>
                            {task.title}
                          </div>
                          <div className="text-xs text-gray-500">{task.status}</div>
                        </div>
                        <div className="grow relative h-10 bg-gray-100 rounded overflow-hidden">
                          <div
                            className={`absolute top-1 bottom-1 ${statusColor} rounded opacity-80 hover:opacity-100 transition flex items-center px-2`}
                            style={{
                              left: `${position.left}%`,
                              width: `${Math.max(2, position.width)}%`,
                              minWidth: '40px',
                            }}
                            title={`${task.title}: ${formatDate(task.startDate)} - ${formatDate(task.endDate)}`}
                          >
                            <span className="text-xs font-semibold text-white truncate">{task.status}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="border-t pt-4 mt-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Status Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${color}`}></div>
              <span className="text-sm text-gray-600 capitalize">{status.replace('-', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Legend */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Priority Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(priorityStyles).map(([priority, style]) => (
            <div key={priority} className="flex items-center gap-2">
              <div className={`w-4 h-1 ${style}`}></div>
              <span className="text-sm text-gray-600 capitalize">{priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
