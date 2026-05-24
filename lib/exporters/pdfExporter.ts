import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToPDF(data: any[], filename: string, title: string) {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
  
  // Prepare table data
  if (data.length === 0) {
    doc.text('No data available', 14, 40);
  } else {
    const headers = Object.keys(data[0]);
    const rows = data.map((item) => headers.map((header) => item[header]));
    
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [114, 47, 55], // Accent color
        textColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });
  }
  
  doc.save(`${filename}.pdf`);
}
