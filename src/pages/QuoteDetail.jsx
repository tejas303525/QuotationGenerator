import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  Download,
  Mail,
  Printer,
  History,
  Clock
} from 'lucide-react';
import Layout from '../components/Layout';
import QuoteDocument from '../components/QuoteDocument';
import { useToast } from '../components/Toast';
import { getQuotes, getSettings, updateQuote } from '../utils/storage';
import { exportQuotePDF } from '../utils/pdfExport';
import { formatDate, isExpired } from '../utils/formatters';

export default function QuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [quote, setQuote] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const quotes = getQuotes();
    const found = quotes.find((q) => q.id === id);
    if (found) {
      setQuote(found);
    }
    setSettings(getSettings());
    setLoading(false);
  }, [id]);

  const handleApprove = () => {
    const updated = {
      ...quote,
      status: 'Approved',
      statusHistory: [
        ...quote.statusHistory,
        { status: 'Approved', timestamp: new Date().toISOString() }
      ]
    };
    updateQuote(updated);
    setQuote(updated);
    showToast('Quote approved successfully', 'success');
  };

  const handleReject = () => {
    const updated = {
      ...quote,
      status: 'Rejected',
      statusHistory: [
        ...quote.statusHistory,
        { status: 'Rejected', timestamp: new Date().toISOString() }
      ]
    };
    updateQuote(updated);
    setQuote(updated);
    showToast('Quote rejected', 'warning');
  };

  const handleExportPDF = () => {
    if (quote && settings) {
      exportQuotePDF(quote, settings);
      showToast('PDF exported successfully', 'success');
    }
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Quote ${quote.quoteNumber}`);
    const body = encodeURIComponent(
      `Dear ${quote.clientSnapshot?.name},\n\n` +
        `Please find attached our quote ${quote.quoteNumber} for your consideration.\n\n` +
        `Grand Total: ${quote.currency} ${quote.grandTotal.toLocaleString()}\n\n` +
        `If you have any questions, please don't hesitate to contact us.\n\n` +
        `Best regards,\n${settings?.company?.name}`
    );
    window.location.href = `mailto:${quote.clientSnapshot?.email}?subject=${subject}&body=${body}`;
    showToast('Email client opened', 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto text-center py-12">Loading...</div>
      </Layout>
    );
  }

  if (!quote) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Quote not found</h1>
          <Link
            to="/dashboard"
            className="text-indigo-500 hover:text-indigo-600"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  const expired = isExpired(quote.expiryDate, quote.status);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/dashboard" className="hover:text-indigo-500">Dashboard</Link>
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span className="text-gray-900">Quote {quote.quoteNumber}</span>
        </nav>

        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quote {quote.quoteNumber}</h1>
            <p className="text-gray-500">Created on {formatDate(quote.date)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {quote.status === 'Pending' && (
              <>
                <button
                  onClick={handleApprove}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}

            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>

            <button
              onClick={handleSendEmail}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Send Email
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Expired Warning */}
        {expired && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 print:hidden">
            <Clock className="w-5 h-5 text-red-500" />
            <p className="text-red-700">
              This quote has expired (expiry date: {formatDate(quote.expiryDate)}). Please
              create a new quote if needed.
            </p>
          </div>
        )}

        {/* Quote Document */}
        <QuoteDocument
          quote={quote}
          company={settings?.company}
          template={settings?.template}
        />

        {/* Status History - hidden on print */}
        <div className="mt-8 print:hidden">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Status History</h2>
            </div>

            <div className="space-y-3">
              {quote.statusHistory?.map((entry, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1.5"></div>
                    {index < quote.statusHistory.length - 1 && (
                      <div className="absolute top-4 left-1.5 w-0.5 h-full -translate-x-1/2 bg-gray-200"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{entry.status}</p>
                    <p className="text-sm text-gray-500">{formatDate(entry.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </Layout>
  );
}
