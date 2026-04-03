import { Eye, CheckCircle, XCircle, Trash2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatCurrency, formatDate, isExpired } from '../utils/formatters';

export default function QuoteTable({ quotes, onApprove, onReject, onDelete, currency = 'AED' }) {
  const getStatusBadge = (quote) => {
    const expired = isExpired(quote.expiryDate, quote.status);
    return <StatusBadge status={quote.status} expired={expired} />;
  };

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
        <p className="text-gray-500 mb-4">Get started by creating your first quote</p>
        <Link
          to="/new-quote"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Create Quote
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quote #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grand Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{quote.quoteNumber}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{quote.clientSnapshot?.name}</p>
                    <p className="text-xs text-gray-500">{quote.clientSnapshot?.company}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(quote.date)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDate(quote.expiryDate)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{quote.items.length}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {formatCurrency(quote.grandTotal, quote.currency || currency)}
                </td>
                <td className="px-4 py-3">{getStatusBadge(quote)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/quote/${quote.id}`}
                      className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {quote.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => onApprove(quote.id)}
                          className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onReject(quote.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onDelete(quote.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
