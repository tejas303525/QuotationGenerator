import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Users, FileText } from 'lucide-react';
import Layout from '../components/Layout';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { getClients, deleteClient, getClientQuoteCount } from '../utils/storage';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [quoteCounts, setQuoteCounts] = useState({});
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    const loadedClients = getClients();
    setClients(loadedClients);

    const counts = {};
    loadedClients.forEach((client) => {
      counts[client.id] = getClientQuoteCount(client.id);
    });
    setQuoteCounts(counts);
  }, []);

  const handleDelete = () => {
    if (deleteId) {
      const count = quoteCounts[deleteId];
      if (count > 0) {
        showToast(
          `Cannot delete client with ${count} associated quote${count > 1 ? 's' : ''}`,
          'error'
        );
        setDeleteId(null);
        return;
      }

      deleteClient(deleteId);
      setClients(getClients());
      setDeleteId(null);
      showToast('Client deleted successfully', 'success');
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-500">Manage your client database</p>
          </div>
          <Link
            to="/clients/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients by name, company, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Clients Grid */}
        {filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <Users className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/clients/${client.id}`}
                      className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteId(client.id)}
                      disabled={quoteCounts[client.id] > 0}
                      className={`p-2 rounded-lg transition-colors ${
                        quoteCounts[client.id] > 0
                          ? 'text-gray-200 cursor-not-allowed'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                      title={
                        quoteCounts[client.id] > 0
                          ? 'Cannot delete client with associated quotes'
                          : 'Delete'
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">{client.name}</h3>
                {client.company && (
                  <p className="text-sm text-gray-500 mb-2">{client.company}</p>
                )}
                <p className="text-sm text-gray-600 mb-4">{client.email}</p>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  <span>{quoteCounts[client.id] || 0} quotes</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Try a different search term' : 'Get started by adding your first client'}
            </p>
            {!searchQuery && (
              <Link
                to="/clients/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Client
              </Link>
            )}
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Client"
          message="Are you sure you want to delete this client? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />

        <ToastContainer />
      </div>
    </Layout>
  );
}
