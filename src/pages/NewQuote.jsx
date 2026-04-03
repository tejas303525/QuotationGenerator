import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, Save, Send } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Layout from '../components/Layout';
import LineItemRow from '../components/LineItemRow';
import ClientQuickAddModal from '../components/ClientQuickAddModal';
import { useToast } from '../components/Toast';
import {
  getClients,
  getSettings,
  saveClient,
  saveQuote,
  generateQuoteNumber
} from '../utils/storage';
import { calcSubtotal, calcTax, calcGrandTotal } from '../utils/calculations';
import { formatCurrency, addDays } from '../utils/formatters';

const defaultLineItem = () => ({
  id: uuidv4(),
  productName: '',
  description: '',
  qty: 1,
  unitPrice: 0,
  total: 0
});

export default function NewQuote() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [clients, setClients] = useState([]);
  const [settings, setSettings] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [items, setItems] = useState([defaultLineItem()]);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [includeTax, setIncludeTax] = useState(true);

  const [formData, setFormData] = useState({
    expiryDate: '',
    notes: '',
    terms: '',
    taxRate: 5
  });

  useEffect(() => {
    const loadedSettings = getSettings();
    setSettings(loadedSettings);
    setClients(getClients());

    const today = new Date();
    const expiry = addDays(today, loadedSettings?.quote?.defaultValidityDays || 30);
    setFormData((prev) => ({
      ...prev,
      expiryDate: expiry.toISOString().split('T')[0],
      terms: loadedSettings?.terms || '',
      taxRate: loadedSettings?.quote?.defaultTaxRate || 5
    }));
  }, []);

  const subtotal = calcSubtotal(items);
  const taxAmount = includeTax ? calcTax(subtotal, formData.taxRate) : 0;
  const grandTotal = calcGrandTotal(subtotal, taxAmount);

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    if (clientId === 'new') {
      setIsClientModalOpen(true);
      e.target.value = '';
    } else if (clientId) {
      const client = clients.find((c) => c.id === clientId);
      setSelectedClient(client);
      setErrors((prev) => ({ ...prev, client: null }));
    } else {
      setSelectedClient(null);
    }
  };

  const handleAddClient = (client) => {
    saveClient(client);
    setClients(getClients());
    setSelectedClient(client);
    setIsClientModalOpen(false);
    showToast('Client added successfully', 'success');
  };

  const handleUpdateItem = useCallback((index, updatedItem) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = updatedItem;
      return newItems;
    });
  }, []);

  const handleRemoveItem = (index) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, defaultLineItem()]);
  };

  const validate = () => {
    const newErrors = {};

    if (!selectedClient) {
      newErrors.client = 'Please select a client';
    }

    const invalidItems = items.some(
      (item) => !item.productName.trim() || item.qty <= 0 || item.unitPrice < 0
    );
    if (invalidItems) {
      newErrors.items = 'Please fill in all item details';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildQuote = (status) => {
    const quoteNumber = generateQuoteNumber(settings);

    return {
      id: uuidv4(),
      quoteNumber,
      clientId: selectedClient.id,
      clientSnapshot: {
        name: selectedClient.name,
        email: selectedClient.email,
        phone: selectedClient.phone,
        company: selectedClient.company,
        address: `${selectedClient.address}${selectedClient.city ? `, ${selectedClient.city}` : ''}${selectedClient.country ? `, ${selectedClient.country}` : ''}`
      },
      date: new Date().toISOString(),
      expiryDate: new Date(formData.expiryDate).toISOString(),
      status,
      items,
      subtotal,
      taxLabel: settings?.quote?.taxLabel || 'VAT',
      taxRate: includeTax ? formData.taxRate : 0,
      taxAmount,
      grandTotal,
      currency: settings?.quote?.currency || 'AED',
      notes: formData.notes,
      terms: formData.terms,
      statusHistory: [
        { status: status === 'Draft' ? 'Draft' : 'Draft', timestamp: new Date().toISOString() },
        ...(status === 'Pending' ? [{ status: 'Pending', timestamp: new Date().toISOString() }] : [])
      ]
    };
  };

  const handleSaveDraft = () => {
    if (!validate()) {
      showToast('Please fix the errors before saving', 'error');
      return;
    }

    const quote = buildQuote('Draft');
    saveQuote(quote);
    showToast('Quote saved as draft', 'success');
    navigate('/dashboard');
  };

  const handleSendForApproval = () => {
    if (!validate()) {
      showToast('Please fix the errors before sending', 'error');
      return;
    }

    const quote = buildQuote('Pending');
    saveQuote(quote);
    showToast('Quote sent for approval', 'success');
    navigate('/dashboard');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/dashboard" className="hover:text-indigo-500">Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">New Quote</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Create New Quote</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Client Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Client</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Client *
                  </label>
                  <select
                    value={selectedClient?.id || ''}
                    onChange={handleClientChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.client ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.company && `(${client.company})`}
                      </option>
                    ))}
                    <option value="new">+ Add New Client</option>
                  </select>
                  {errors.client && (
                    <p className="text-sm text-red-600 mt-1">{errors.client}</p>
                  )}
                </div>

                {selectedClient && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{selectedClient.name}</p>
                        {selectedClient.company && (
                          <p className="text-sm text-gray-600">{selectedClient.company}</p>
                        )}
                        <p className="text-sm text-gray-600">{selectedClient.email}</p>
                        {selectedClient.phone && (
                          <p className="text-sm text-gray-600">{selectedClient.phone}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedClient(null)}
                        className="text-sm text-red-500 hover:text-red-600"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
                <button
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              {errors.items && (
                <p className="text-sm text-red-600 mb-4">{errors.items}</p>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="text-center py-2 text-xs font-medium text-gray-500 uppercase w-24">Qty</th>
                      <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase w-32">Unit Price</th>
                      <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase w-32">Total</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <LineItemRow
                        key={item.id}
                        item={item}
                        index={index}
                        onUpdate={handleUpdateItem}
                        onRemove={handleRemoveItem}
                        canRemove={items.length > 1}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quote Settings */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quote Details</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add any notes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, terms: e.target.value }))
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Quote Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(subtotal, settings?.quote?.currency)}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id="includeTax"
                      checked={includeTax}
                      onChange={(e) => setIncludeTax(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
                    />
                    <label htmlFor="includeTax" className="text-sm text-gray-700">
                      Include Tax
                    </label>
                  </div>

                  {includeTax && (
                    <div className="pl-6 space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Tax Rate (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.taxRate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              taxRate: parseFloat(e.target.value) || 0
                            }))
                          }
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {settings?.quote?.taxLabel || 'Tax'} ({formData.taxRate}%)
                        </span>
                        <span className="font-medium">
                          {formatCurrency(taxAmount, settings?.quote?.currency)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-4">
                  <span className="text-gray-900">Grand Total</span>
                  <span className="text-indigo-600">
                    {formatCurrency(grandTotal, settings?.quote?.currency)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleSaveDraft}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save as Draft
                </button>

                <button
                  onClick={handleSendForApproval}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send for Approval
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClientQuickAddModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleAddClient}
      />

      <ToastContainer />
    </Layout>
  );
}
