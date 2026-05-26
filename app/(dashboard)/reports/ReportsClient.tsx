'use client';

import React, { useState } from 'react';
import { getExportData } from '@/actions/analyticsActions';
import { toast } from '@/lib/toast';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import GanttChart from '@/components/analytics/GanttChart';

export function ReportsClient() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'export' | 'gantt'>('analytics');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const result = await getExportData();
      if (result.success && result.data) {
        const headers = ['ID', 'Title', 'Status', 'Priority', 'Assignee', 'Project', 'Due Date'];
        const rows = result.data.map((task) => [
          task.id,
          task.title,
          task.status,
          task.priority,
          task.assignee,
          task.project,
          task.dueDate || '',
        ]);

        let csv = headers.join(',') + '\n';
        rows.forEach((row) => {
          csv += row.map((cell) => `"${cell}"`).join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `tasks-export-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Tasks exported as CSV');
      }
    } catch {
      toast.error('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const result = await getExportData();
      if (result.success && result.data) {
        const json = JSON.stringify(result.data, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `tasks-export-${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Tasks exported as JSON');
      }
    } catch {
      toast.error('Failed to export JSON');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'analytics'
              ? 'text-accent border-b-2 border-accent'
              : 'text-muted hover:text-foreground'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('gantt')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'gantt'
              ? 'text-accent border-b-2 border-accent'
              : 'text-muted hover:text-foreground'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'export'
              ? 'text-accent border-b-2 border-accent'
              : 'text-muted hover:text-foreground'
          }`}
        >
          Export Data
        </button>
      </div>

      {activeTab === 'analytics' && <AnalyticsDashboard />}

      {activeTab === 'gantt' && (
        <div className="space-y-4 p-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Project Timeline</h2>
            <p className="text-muted mt-2">Visual Gantt chart of all project schedules</p>
          </div>
          <GanttChart />
        </div>
      )}

      {activeTab === 'export' && (
        <div className="space-y-6 p-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Export Data</h2>
            <p className="text-muted mt-2">Download your tasks in various formats</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExportCard
              title="Export as CSV"
              description="Comma-separated values for spreadsheet applications"
              format="CSV"
              onClick={handleExportCSV}
              disabled={isExporting}
            />
            <ExportCard
              title="Export as JSON"
              description="JSON format for integration with other tools"
              format="JSON"
              onClick={handleExportJSON}
              disabled={isExporting}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface ExportCardProps {
  title: string;
  description: string;
  format: string;
  onClick: () => void;
  disabled: boolean;
}

function ExportCard({ title, description, format, onClick, disabled }: ExportCardProps) {
  return (
    <div className="bg-surface rounded-lg border border-border p-6 hover:border-accent transition">
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted text-sm mb-4">{description}</p>
      <button
        onClick={onClick}
        disabled={disabled}
        className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover disabled:bg-muted transition font-medium"
      >
        {disabled ? 'Exporting...' : `Download ${format}`}
      </button>
    </div>
  );
}

