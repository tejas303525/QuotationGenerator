import { useState, useEffect } from 'react';
import { Building2, FileText, FileCheck, Palette, Package, Save, Check, Upload, FileCode, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useToast } from '../components/Toast';
import { getSettings, saveSettings, getProducts, saveProduct, updateProduct, deleteProduct } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
      active
        ? 'border-indigo-500 text-indigo-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const TemplateCard = ({ name, selected, onClick, isCustom }) => {
  const previews = {
    classic: 'bg-white border-gray-300',
    modern: 'bg-gradient-to-br from-slate-50 to-white border-slate-200',
    minimal: 'bg-white border-gray-100 shadow-sm'
  };

  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 transition-all ${
        selected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {isCustom ? (
        <div className="h-24 rounded-lg border border-gray-200 bg-blue-50 flex items-center justify-center mb-3">
          <FileCode className="w-8 h-8 text-blue-400" />
        </div>
      ) : (
        <div className={`h-24 rounded-lg border ${previews[name]} mb-3`} ></div>
      )}
      <p className="font-medium text-gray-900 capitalize truncate">{name}</p>
      {selected && (
        <div className="absolute top-2 right-2 p-1 bg-indigo-500 rounded-full">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  );
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company');
  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [customTemplates, setCustomTemplates] = useState([]);
  const { showToast, ToastContainer } = useToast();

  // Product form state
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    description: '',
    defaultPrice: '',
    unit: 'per unit'
  });
  const [editingProduct, setEditingProduct] = useState(false);

  useEffect(() => {
    const loaded = getSettings();
    setSettings(loaded);
    setProducts(getProducts());
    setCustomTemplates(loaded?.customTemplates || []);
  }, []);

  const handleSave = () => {
    setSaving(true);
    saveSettings({ ...settings, customTemplates });
    setTimeout(() => {
      setSaving(false);
      showToast('Settings saved successfully', 'success');
    }, 500);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({
          ...settings,
          company: { ...settings.company, logo: reader.result }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle custom template upload
  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['text/html', 'text/css', 'application/json', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.html') && !file.name.endsWith('.css')) {
      showToast('Please upload an HTML or CSS template file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newTemplate = {
        id: uuidv4(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        filename: file.name,
        content: reader.result,
        type: file.type || 'text/html',
        uploadedAt: new Date().toISOString()
      };
      const updatedTemplates = [...customTemplates, newTemplate];
      setCustomTemplates(updatedTemplates);
      showToast('Template uploaded successfully', 'success');
    };
    reader.readAsText(file);
  };

  const handleDeleteTemplate = (templateId) => {
    const updatedTemplates = customTemplates.filter(t => t.id !== templateId);
    setCustomTemplates(updatedTemplates);

    // If the deleted template was selected, reset to 'classic'
    if (settings?.template === templateId) {
      setSettings({ ...settings, template: 'classic' });
    }
    showToast('Template deleted', 'success');
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.defaultPrice) return;

    const productData = {
      id: editingProduct ? productForm.id : uuidv4(),
      name: productForm.name,
      description: productForm.description,
      defaultPrice: parseFloat(productForm.defaultPrice),
      unit: productForm.unit
    };

    if (editingProduct) {
      updateProduct(productData);
      showToast('Product updated', 'success');
    } else {
      saveProduct(productData);
      showToast('Product added', 'success');
    }

    setProducts(getProducts());
    setProductForm({ id: null, name: '', description: '', defaultPrice: '', unit: 'per unit' });
    setEditingProduct(false);
  };

  const handleEditProduct = (product) => {
    setProductForm({
      id: product.id,
      name: product.name,
      description: product.description,
      defaultPrice: product.defaultPrice.toString(),
      unit: product.unit
    });
    setEditingProduct(true);
  };

  const handleDeleteProduct = (id) => {
    deleteProduct(id);
    setProducts(getProducts());
    showToast('Product deleted', 'success');
  };

  if (!settings) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8 overflow-x-auto">
          <div className="flex gap-2">
            <TabButton
              active={activeTab === 'company'}
              onClick={() => setActiveTab('company')}
              icon={Building2}
              label="Company Profile"
            />
            <TabButton
              active={activeTab === 'quote'}
              onClick={() => setActiveTab('quote')}
              icon={FileText}
              label="Quote Defaults"
            />
            <TabButton
              active={activeTab === 'terms'}
              onClick={() => setActiveTab('terms')}
              icon={FileCheck}
              label="Terms & Conditions"
            />
            <TabButton
              active={activeTab === 'template'}
              onClick={() => setActiveTab('template')}
              icon={Palette}
              label="Template"
            />
            <TabButton
              active={activeTab === 'products'}
              onClick={() => setActiveTab('products')}
              icon={Package}
              label="Product Catalog"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          {/* Company Profile */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                <div className="flex items-center gap-4">
                  {settings.company.logo ? (
                    <img
                      src={settings.company.logo}
                      alt="Company Logo"
                      className="h-20 w-auto object-contain border rounded-lg"
                    />
                  ) : (
                    <div className="h-20 w-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Upload className="w-4 h-4" />
                    Upload Logo
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {settings.company.logo && (
                    <button
                      onClick={() =>
                        setSettings({
                          ...settings,
                          company: { ...settings.company, logo: '' }
                        })
                      }
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={settings.company.name}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        company: { ...settings.company, name: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={settings.company.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        company: { ...settings.company, email: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={settings.company.phone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        company: { ...settings.company, phone: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                  <input
                    type="text"
                    value={settings.company.registrationNumber}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        company: { ...settings.company, registrationNumber: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax/VAT Number</label>
                  <input
                    type="text"
                    value={settings.company.taxNumber}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        company: { ...settings.company, taxNumber: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={settings.company.address}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        company: { ...settings.company, address: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={settings.company.city}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          company: { ...settings.company, city: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={settings.company.country}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          company: { ...settings.company, country: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quote Defaults */}
          {activeTab === 'quote' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Quote Settings</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quote Number Prefix</label>
                  <input
                    type="text"
                    value={settings.quote.prefix}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        quote: { ...settings.quote, prefix: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Example: QT-0001</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Starting Number</label>
                  <input
                    type="number"
                    value={settings.quote.startingNumber}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        quote: { ...settings.quote, startingNumber: parseInt(e.target.value) || 1 }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Validity (days)</label>
                  <input
                    type="number"
                    value={settings.quote.defaultValidityDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        quote: { ...settings.quote, defaultValidityDays: parseInt(e.target.value) || 30 }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                  <select
                    value={settings.quote.currency}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        quote: { ...settings.quote, currency: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {['AED', 'USD', 'EUR', 'GBP', 'SAR', 'QAR'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Label</label>
                  <select
                    value={settings.quote.taxLabel}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        quote: { ...settings.quote, taxLabel: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option>VAT</option>
                    <option>GST</option>
                    <option>Sales Tax</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.quote.defaultTaxRate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        quote: { ...settings.quote, defaultTaxRate: parseFloat(e.target.value) || 0 }
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Default Terms & Conditions</h2>

              <textarea
                value={settings.terms}
                onChange={(e) => setSettings({ ...settings, terms: e.target.value })}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your default terms and conditions..."
              />
              <p className="text-sm text-gray-500 text-right">
                {settings.terms.length} characters
              </p>
            </div>
          )}

          {/* Template */}
          {activeTab === 'template' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Quote Template Style</h2>

              {/* Predefined Templates */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Built-in Templates</h3>
                <div className="grid grid-cols-3 gap-4">
                  {['classic', 'modern', 'minimal'].map((template) => (
                    <TemplateCard
                      key={template}
                      name={template}
                      selected={settings.template === template}
                      onClick={() => setSettings({ ...settings, template })}
                    />
                  ))}
                </div>
              </div>

              {/* Custom Template Upload */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Custom Templates</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Upload HTML or CSS files to create custom quote templates. The template should contain placeholders like {'{{companyName}}'}, {'{{quoteNumber}}'}, etc.
                </p>

                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload Template
                  <input
                    type="file"
                    accept=".html,.css,.txt,text/html,text/css"
                    onChange={handleTemplateUpload}
                    className="hidden"
                  />
                </label>

                {/* Uploaded Custom Templates */}
                {customTemplates.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Templates</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {customTemplates.map((template) => (
                        <div key={template.id} className="relative group">
                          <TemplateCard
                            name={template.name}
                            selected={settings.template === template.id}
                            onClick={() => setSettings({ ...settings, template: template.id })}
                            isCustom
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Template Preview */}
              {settings.template && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Template</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Currently using: <span className="font-medium text-gray-900">
                        {typeof settings.template === 'string' && ['classic', 'modern', 'minimal'].includes(settings.template)
                          ? settings.template.charAt(0).toUpperCase() + settings.template.slice(1)
                          : customTemplates.find(t => t.id === settings.template)?.name || 'Custom Template'}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Product Catalog */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Product Catalog</h2>

              {/* Add/Edit Form */}
              <form onSubmit={handleProductSubmit} className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={productForm.defaultPrice}
                    onChange={(e) => setProductForm({ ...productForm, defaultPrice: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="flex gap-2">
                    <select
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="per unit">per unit</option>
                      <option value="per hour">per hour</option>
                      <option value="per day">per day</option>
                      <option value="flat">flat</option>
                      <option value="per month">per month</option>
                      <option value="per year">per year</option>
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                    >
                      {editingProduct ? 'Update' : 'Add'}
                    </button>
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          setProductForm({ id: null, name: '', description: '', defaultPrice: '', unit: 'per unit' });
                          setEditingProduct(false);
                        }}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {/* Products List */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Unit</th>
                      <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100">
                        <td className="py-3 font-medium">{product.name}</td>
                        <td className="py-3 text-gray-600 text-sm">{product.description}</td>
                        <td className="py-3 text-right">{product.defaultPrice.toFixed(2)}</td>
                        <td className="py-3 text-sm text-gray-600">{product.unit}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-indigo-500 hover:text-indigo-600 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Save Button */}
          {activeTab !== 'products' && (
            <div className="pt-6 mt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          )}
        </div>

        <ToastContainer />
      </div>
    </Layout>
  );
}
