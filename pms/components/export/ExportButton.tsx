'use client';

import * as React from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { exportToCSV } from '@/lib/exporters/csvExporter';
import { exportToPDF } from '@/lib/exporters/pdfExporter';
import { toast } from '@/lib/toast';

interface ExportButtonProps {
  data: any[];
  filename: string;
  title: string;
}

export function ExportButton({ data, filename, title }: ExportButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleExportCSV = () => {
    try {
      exportToCSV(data, filename);
      toast.success('Exported to CSV successfully');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const handleExportPDF = () => {
    try {
      exportToPDF(data, filename, title);
      toast.success('Exported to PDF successfully');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
      >
        <Download size={16} />
        <span>Export</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] shadow-lg overflow-hidden">
            <button
              onClick={handleExportCSV}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-raised)] transition-colors"
            >
              <FileSpreadsheet size={16} className="text-green-500" />
              <span>Export as CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-raised)] transition-colors border-t border-[var(--border-color)]"
            >
              <FileText size={16} className="text-red-500" />
              <span>Export as PDF</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
