import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface PDFExportData {
  filename: string;
  title: string;
  data: Array<Record<string, string | number | boolean | null>>;
  columns: {
    header: string;
    dataKey: string;
  }[];
}

/**
 * Generate a professional PDF export
 */
export async function generatePDF(options: PDFExportData): Promise<void> {
  try {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text(options.title, 14, 22);

    // Add generation date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);

    // Reset text color
    doc.setTextColor(0);

    // Add table
    const tableData = options.data.map((row) =>
      options.columns.map((col) => {
        const value = row[col.dataKey];
        if (typeof value === 'string' && !isNaN(Date.parse(value))) {
          return new Date(value).toLocaleDateString();
        }
        if (typeof value === 'boolean') {
          return value ? 'Yes' : 'No';
        }
        if (value === null || value === undefined) {
          return '';
        }
        return String(value).substring(0, 50); // Limit cell content
      })
    );

    const headers = options.columns.map((col) => col.header);

    // @ts-expect-error - jsPDF-autotable types
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 5,
        overflow: 'ellipsis',
      },
      headStyles: {
        fillColor: [147, 51, 234], // Purple
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 250], // Light purple
      },
      margin: { top: 40 },
    });

    // Add footer
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150);

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    doc.save(options.filename);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
}

/**
 * Generate analytics report PDF
 */
export async function generateAnalyticsPDF(
  analyticsData: {
    taskCompletionRate: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    highRiskTasks: number;
  },
  reportType: string
): Promise<void> {
  const doc = new jsPDF();

  // Title page
  doc.setFontSize(20);
  doc.text('Analytics Report', 14, 30);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Report Type: ${reportType}`, 14, 45);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 55);

  // Add key metrics
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Key Metrics', 14, 70);

  doc.setFontSize(10);
  let yPosition = 80;

  const metrics = [
    { label: 'Completion Rate', value: `${analyticsData.taskCompletionRate}%` },
    { label: 'Total Tasks', value: analyticsData.totalTasks },
    { label: 'Completed Tasks', value: analyticsData.completedTasks },
    { label: 'Overdue Tasks', value: analyticsData.overdueTasks },
    { label: 'High Risk Tasks', value: analyticsData.highRiskTasks },
  ];

  metrics.forEach((metric) => {
    doc.text(`${metric.label}: ${metric.value}`, 20, yPosition);
    yPosition += 10;
  });

  // Save PDF
  doc.save(`analytics-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
}
