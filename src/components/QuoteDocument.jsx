import { FileText, Mail, Phone, MapPin, Building2, Calendar, Hash, Clock } from 'lucide-react';
import { formatCurrency, formatDate, isExpired, formatNumber } from '../utils/formatters';
import StatusBadge from './StatusBadge';
import { getSettings } from '../utils/storage';

export default function QuoteDocument({ quote, company, template = 'classic' }) {
  const expired = isExpired(quote.expiryDate, quote.status);
  const settings = getSettings();
  const customTemplates = settings?.customTemplates || [];

  // Check if using a custom template
  const isCustomTemplate = template && !['classic', 'modern', 'minimal'].includes(template);
  const customTemplate = isCustomTemplate ? customTemplates.find(t => t.id === template) : null;

  // Render custom HTML template with placeholders replaced
  if (customTemplate) {
    let html = customTemplate.content;

    // Replace placeholders with actual values
    const replacements = {
      '{{companyName}}': company?.name || '',
      '{{companyEmail}}': company?.email || '',
      '{{companyPhone}}': company?.phone || '',
      '{{companyAddress}}': company?.address || '',
      '{{companyCity}}': company?.city || '',
      '{{companyCountry}}': company?.country || '',
      '{{companyRegistration}}': company?.registrationNumber || '',
      '{{companyTaxNumber}}': company?.taxNumber || '',
      '{{companyLogo}}': company?.logo || '',
      '{{quoteNumber}}': quote.quoteNumber || '',
      '{{quoteDate}}': formatDate(quote.date) || '',
      '{{quoteExpiry}}': formatDate(quote.expiryDate) || '',
      '{{quoteStatus}}': quote.status || '',
      '{{clientName}}': quote.clientSnapshot?.name || '',
      '{{clientCompany}}': quote.clientSnapshot?.company || '',
      '{{clientEmail}}': quote.clientSnapshot?.email || '',
      '{{clientPhone}}': quote.clientSnapshot?.phone || '',
      '{{clientAddress}}': quote.clientSnapshot?.address || '',
      '{{subtotal}}': formatCurrency(quote.subtotal, quote.currency) || '',
      '{{taxLabel}}': quote.taxLabel || '',
      '{{taxRate}}': quote.taxRate?.toString() || '',
      '{{taxAmount}}': formatCurrency(quote.taxAmount, quote.currency) || '',
      '{{grandTotal}}': formatCurrency(quote.grandTotal, quote.currency) || '',
      '{{currency}}': quote.currency || '',
      '{{notes}}': quote.notes || '',
      '{{terms}}': quote.terms || ''
    };

    // Replace simple placeholders
    Object.entries(replacements).forEach(([key, value]) => {
      html = html.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    });

    // Handle line items table - look for {{lineItems}} placeholder
    if (html.includes('{{lineItems}}')) {
      const lineItemsHtml = quote.items.map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.productName}</td>
          <td>${item.description || '-'}</td>
          <td>${item.qty}</td>
          <td>${formatCurrency(item.unitPrice, quote.currency)}</td>
          <td>${formatCurrency(item.total, quote.currency)}</td>
        </tr>
      `).join('');
      html = html.replace('{{lineItems}}', lineItemsHtml);
    }

    // Handle status badge styling
    const statusColors = {
      Draft: 'bg-gray-100 text-gray-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800'
    };
    const statusColor = statusColors[quote.status] || 'bg-gray-100 text-gray-800';
    html = html.replace('{{statusClass}}', statusColor);

    return (
      <div className="quote-document bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  }

  const templates = {
    classic: 'bg-white border-gray-200',
    modern: 'bg-gradient-to-br from-slate-50 to-white border-slate-200',
    minimal: 'bg-white border-gray-100 shadow-sm'
  };

  return (
    <div className={`p-8 border rounded-xl ${templates[template] || templates.classic}`}>
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-200 pb-6">
        <div className="flex items-start gap-4">
          {company?.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="h-16 w-auto object-contain"
            />
          ) : (
            <div className="p-3 bg-indigo-500 rounded-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{company?.name || 'Your Company'}</h2>
            {company?.registrationNumber && (
              <p className="text-sm text-gray-500">Reg: {company.registrationNumber}</p>
            )}
            {company?.taxNumber && (
              <p className="text-sm text-gray-500">{company.taxNumber}</p>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">{company?.email}</p>
          <p className="text-sm text-gray-500">{company?.phone}</p>
          <p className="text-sm text-gray-500">{company?.address}</p>
          <p className="text-sm text-gray-500">{company?.city} {company?.country}</p>
        </div>
      </div>

      {/* Quote Info & Bill To */}
      <div className="grid grid-cols-2 gap-8 py-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Quote Information</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Hash className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Quote #:</span>
              <span className="font-medium text-gray-900">{quote.quoteNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Date:</span>
              <span className="font-medium text-gray-900">{formatDate(quote.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Expiry:</span>
              <span className="font-medium text-gray-900">{formatDate(quote.expiryDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-4">
              <span className="text-gray-600">Status:</span>
              <StatusBadge status={quote.status} expired={expired} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Bill To</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900">{quote.clientSnapshot?.name}</span>
            </div>
            {quote.clientSnapshot?.company && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-900 font-medium">{quote.clientSnapshot.company}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{quote.clientSnapshot?.email}</span>
            </div>
            {quote.clientSnapshot?.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{quote.clientSnapshot.phone}</span>
              </div>
            )}
            {quote.clientSnapshot?.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{quote.clientSnapshot.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="py-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
              <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
              <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
              <th className="text-center py-3 text-xs font-semibold text-gray-500 uppercase">Qty</th>
              <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase">Unit Price</th>
              <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quote.items.map((item, index) => (
              <tr key={item.id}>
                <td className="py-3 text-sm text-gray-500">{index + 1}</td>
                <td className="py-3 text-sm font-medium text-gray-900">{item.productName}</td>
                <td className="py-3 text-sm text-gray-600">{item.description || '-'}</td>
                <td className="py-3 text-sm text-center text-gray-600">{item.qty}</td>
                <td className="py-3 text-sm text-right text-gray-600">
                  {formatCurrency(item.unitPrice, quote.currency)}
                </td>
                <td className="py-3 text-sm text-right font-medium text-gray-900">
                  {formatCurrency(item.total, quote.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-end">
          <div className="w-80 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium text-gray-900">{formatCurrency(quote.subtotal, quote.currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{quote.taxLabel} ({quote.taxRate}%):</span>
              <span className="font-medium text-gray-900">{formatCurrency(quote.taxAmount, quote.currency)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
              <span className="text-gray-900">Grand Total:</span>
              <span className="text-indigo-600">{formatCurrency(quote.grandTotal, quote.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {quote.notes && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes:</h4>
          <p className="text-sm text-gray-600 whitespace-pre-line">{quote.notes}</p>
        </div>
      )}

      {/* Terms */}
      {quote.terms && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Terms & Conditions:</h4>
          <p className="text-sm text-gray-600 whitespace-pre-line">{quote.terms}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6 mt-6 text-center">
        <p className="text-sm text-gray-500">Thank you for your business!</p>
      </div>
    </div>
  );
}
