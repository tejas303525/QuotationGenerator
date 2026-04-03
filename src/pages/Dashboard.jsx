import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, Clock, XCircle, DollarSign, Plus } from 'lucide-react';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import QuoteTable from '../components/QuoteTable';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { getQuotes, getSettings, updateQuote, deleteQuote } from '../utils/storage';

export default function Dashboard() {
  const [quotes, setQuotes] = useState([]);
  const [settings, setSettings] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    setQuotes(getQuotes());
    setSettings(getSettings());
  }, []);

  const handleApprove = (id) => {
    const quote = quotes.find(q => q.id === id);
    if (quote) {
      const updated = {
        ...quote,
        status: 'Approved',
        statusHistory: [
          ...quote.statusHistory,
          { status: 'Approved', timestamp: new Date().toISOString() }
        ]
      };
      updateQuote(updated);
      setQuotes(getQuotes());
      showToast('Quote approved successfully', 'success');
    }
  };

  const handleReject = (id) => {
    const quote = quotes.find(q => q.id === id);
    if (quote) {
      const updated = {
        ...quote,
        status: 'Rejected',
        statusHistory: [
          ...quote.statusHistory,
          { status: 'Rejected', timestamp: new Date().toISOString() }
        ]
      };
      updateQuote(updated);
      setQuotes(getQuotes());
      showToast('Quote rejected', 'warning');
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteQuote(deleteId);
      setQuotes(getQuotes());
      setDeleteId(null);
      showToast('Quote deleted successfully', 'success');
    }
  };

  const filteredQuotes = quotes.filter((quote) => {
    const matchesFilter = filter === 'All' || quote.status === filter;
    const matchesSearch =
      quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.clientSnapshot?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.clientSnapshot?.company?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: quotes.length,
    approved: quotes.filter(q => q.status === 'Approved').length,
    pending: quotes.filter(q => q.status === 'Pending').length,
    rejected: quotes.filter(q => q.status === 'Rejected').length,
    revenue: quotes
      .filter(q => q.status === 'Approved')
      .reduce((sum, q) => sum + q.grandTotal, 0)
  };

  const filters = ['All', 'Draft', 'Pending', 'Approved', 'Rejected'];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Manage your quotes and track performance</p>
          </div>
          <Link
            to="/new-quote"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Quote
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <SummaryCard
            title="Total Quotes"
            value={stats.total}
            icon={FileText}
            color="indigo"
          />
          <SummaryCard
            title="Approved"
            value={stats.approved}
            icon={CheckCircle}
            color="green"
          />
          <SummaryCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            color="yellow"
          />
          <SummaryCard
            title="Rejected"
            value={stats.rejected}
            icon={XCircle}
            color="red"
          />
          <SummaryCard
            title="Total Revenue"
            value={settings ? `${settings.quote.currency} ${stats.revenue.toLocaleString()}` : '-'}
            icon={DollarSign}
            color="blue"
          />
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search quotes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Quotes Table */}
        <QuoteTable
          quotes={filteredQuotes}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={setDeleteId}
          currency={settings?.quote?.currency}
        />

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Quote"
          message="Are you sure you want to delete this quote? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />

        <ToastContainer />
      </div>
    </Layout>
  );
}
