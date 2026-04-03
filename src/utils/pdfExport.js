import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';

export const exportQuotePDF = (quote, settings) => {
  const doc = new jsPDF();
  const company = settings?.company || {};
  const template = settings?.template || 'classic';

  // Check if using custom template
  const customTemplates = settings?.customTemplates || [];
  const isCustomTemplate = template && !['classic', 'modern', 'minimal'].includes(template);
  const customTemplate = isCustomTemplate ? customTemplates.find(t => t.id === template) : null;

  // If custom template is selected, we show a notice that PDF uses default style
  // Custom HTML templates are best viewed/printed from browser
  let templateNotice = '';
  if (isCustomTemplate && customTemplate) {
    templateNotice = `(Using "${customTemplate.name}" template in web view)`;
  }

  // Colors based on template
  const colors = {
    classic: { primary: [30, 41, 59], accent: [99, 102, 241] },
    modern: { primary: [17, 24, 39], accent: [59, 130, 246] },
    minimal: { primary: [75, 85, 99], accent: [107, 114, 128] }
  };

  // For custom templates, use 'modern' style as base
  const baseTemplate = colors[template] ? template : 'classic';
  const theme = colors[baseTemplate] || colors.classic;

  // Header
  doc.setFillColor(...theme.primary);
  doc.rect(0, 0, 210, 40, 'F');

  // Company Logo (if available)
  let logoY = 15;
  if (company.logo) {
    try {
      doc.addImage(company.logo, 'JPEG', 14, 10, 30, 20);
      logoY = 35;
    } catch (e) {
      // Continue without logo
    }
  }

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name || 'Your Company', 14, logoY);

  // Company Details (right side)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const rightX = 140;
  let rightY = 15;

  if (company.email) {
    doc.text(`Email: ${company.email}`, rightX, rightY);
    rightY += 5;
  }
  if (company.phone) {
    doc.text(`Phone: ${company.phone}`, rightX, rightY);
    rightY += 5;
  }
  if (company.address) {
    const address = `${company.address}${company.city ? `, ${company.city}` : ''}${company.country ? `, ${company.country}` : ''}`;
    doc.text(`Address: ${address}`, rightX, rightY);
  }

  // Quote Title
  doc.setTextColor(...theme.primary);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', 14, 55);

  // Quote Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Quote Number: ${quote.quoteNumber}`, 14, 65);
  doc.text(`Date: ${formatDate(quote.date)}`, 14, 71);
  doc.text(`Expiry Date: ${formatDate(quote.expiryDate)}`, 14, 77);

  // Custom template notice
  if (templateNotice) {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(templateNotice, 14, 83);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
  }

  // Status Badge
  const statusColors = {
    Draft: [156, 163, 175],
    Pending: [251, 191, 36],
    Approved: [34, 197, 94],
    Rejected: [239, 68, 68]
  };
  const statusColor = statusColors[quote.status] || [156, 163, 175];
  doc.setFillColor(...statusColor);
  doc.roundedRect(140, 58, 50, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Status: ${quote.status}`, 165, 64, { align: 'center' });

  // Bill To Section
  doc.setTextColor(...theme.primary);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 14, 95);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let clientY = 103;

  if (quote.clientSnapshot?.name) {
    doc.text(quote.clientSnapshot.name, 14, clientY);
    clientY += 5;
  }
  if (quote.clientSnapshot?.company) {
    doc.setFont('helvetica', 'bold');
    doc.text(quote.clientSnapshot.company, 14, clientY);
    doc.setFont('helvetica', 'normal');
    clientY += 5;
  }
  if (quote.clientSnapshot?.address) {
    doc.text(quote.clientSnapshot.address, 14, clientY);
    clientY += 5;
  }
  if (quote.clientSnapshot?.email) {
    doc.text(`Email: ${quote.clientSnapshot.email}`, 14, clientY);
    clientY += 5;
  }
  if (quote.clientSnapshot?.phone) {
    doc.text(`Phone: ${quote.clientSnapshot.phone}`, 14, clientY);
  }

  // Line Items Table
  const tableData = quote.items.map((item, index) => [
    index + 1,
    item.productName,
    item.description || '-',
    item.qty,
    formatCurrency(item.unitPrice, quote.currency).replace(/[^\d.,]/g, ''),
    formatCurrency(item.total, quote.currency).replace(/[^\d.,]/g, '')
  ]);

  doc.autoTable({
    startY: 130,
    head: [['#', 'Product', 'Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: theme.primary,
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 50 },
      2: { cellWidth: 60 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' }
    },
    styles: {
      overflow: 'linebreak'
    }
  });

  // Summary Section
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.text('Subtotal:', 140, finalY);
  doc.text(formatCurrency(quote.subtotal, quote.currency), 195, finalY, { align: 'right' });

  doc.text(`${quote.taxLabel} (${quote.taxRate}%):`, 140, finalY + 7);
  doc.text(formatCurrency(quote.taxAmount, quote.currency), 195, finalY + 7, { align: 'right' });

  // Grand Total Box
  doc.setFillColor(...theme.primary);
  doc.rect(135, finalY + 12, 65, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Grand Total:', 140, finalY + 20);
  doc.text(formatCurrency(quote.grandTotal, quote.currency), 195, finalY + 20, { align: 'right' });

  // Notes
  if (quote.notes) {
    doc.setTextColor(...theme.primary);
    doc.setFontSize(11);
    doc.text('Notes:', 14, finalY + 35);
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(quote.notes, 100);
    doc.text(splitNotes, 14, finalY + 42);
  }

  // Terms
  if (quote.terms) {
    const termsY = quote.notes ? finalY + 55 : finalY + 35;
    doc.setTextColor(...theme.primary);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', 14, termsY);
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const splitTerms = doc.splitTextToSize(quote.terms, 180);
    doc.text(splitTerms, 14, termsY + 7);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.text('Thank you for your business!', 105, pageHeight - 20, { align: 'center' });

  // Save PDF
  const clientName = quote.clientSnapshot?.company || quote.clientSnapshot?.name || 'Client';
  const safeClientName = clientName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${quote.quoteNumber}-${safeClientName}.pdf`);
};
