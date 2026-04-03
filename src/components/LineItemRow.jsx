import { useState, useEffect, useRef } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { getProducts, saveProduct } from '../utils/storage';
import { calcLineTotal } from '../utils/calculations';
import { v4 as uuidv4 } from 'uuid';

// Product Quick Add Modal
function ProductQuickAddModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultPrice: '',
    unit: 'per unit'
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.defaultPrice || parseFloat(formData.defaultPrice) < 0) {
      newErrors.defaultPrice = 'Please enter a valid price';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const newProduct = {
        id: uuidv4(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        defaultPrice: parseFloat(formData.defaultPrice),
        unit: formData.unit
      };
      onSave(newProduct);
      setFormData({ name: '', description: '', defaultPrice: '', unit: 'per unit' });
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add New Item</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Consulting Service"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.defaultPrice}
                onChange={(e) => handleChange('defaultPrice', e.target.value)}
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.defaultPrice ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.defaultPrice && <p className="text-xs text-red-600 mt-1">{errors.defaultPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="per unit">per unit</option>
                <option value="per hour">per hour</option>
                <option value="per day">per day</option>
                <option value="flat">flat</option>
                <option value="per month">per month</option>
                <option value="per year">per year</option>
                <option value="per project">per project</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LineItemRow({ item, index, onUpdate, onRemove, canRemove }) {
  const [products, setProducts] = useState([]);
  const [isCustom, setIsCustom] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  useEffect(() => {
    if (item.productName) {
      const product = products.find(p => p.name === item.productName);
      setIsCustom(!product);
    }
  }, [item.productName, products]);

  const handleProductChange = (e) => {
    const productName = e.target.value;
    if (productName === 'add-new') {
      setIsModalOpen(true);
      // Reset select to empty
      e.target.value = '';
    } else {
      const product = products.find(p => p.name === productName);
      if (product) {
        const newItem = {
          ...item,
          productName: product.name,
          description: product.description,
          unitPrice: product.defaultPrice,
          total: calcLineTotal(item.qty, product.defaultPrice)
        };
        onUpdate(index, newItem);
        setIsCustom(false);
      }
    }
  };

  const handleAddProduct = (newProduct) => {
    saveProduct(newProduct);
    const updatedProducts = getProducts();
    setProducts(updatedProducts);
    setIsModalOpen(false);

    // Auto-select the newly added product
    const newItem = {
      ...item,
      productName: newProduct.name,
      description: newProduct.description,
      unitPrice: newProduct.defaultPrice,
      total: calcLineTotal(item.qty, newProduct.defaultPrice)
    };
    onUpdate(index, newItem);
    setIsCustom(false);
  };

  const handleChange = (field, value) => {
    const newItem = { ...item, [field]: value };
    if (field === 'qty' || field === 'unitPrice') {
      newItem.total = calcLineTotal(
        field === 'qty' ? value : item.qty,
        field === 'unitPrice' ? value : item.unitPrice
      );
    }
    onUpdate(index, newItem);
  };

  return (
    <>
      <tr className="border-b border-gray-100 last:border-0">
        <td className="py-3 px-2">
          <select
            value={isCustom ? '' : item.productName}
            onChange={handleProductChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select product...</option>
            {products.map((product) => (
              <option key={product.id} value={product.name}>{product.name}</option>
            ))}
            <option value="add-new" className="font-medium text-indigo-600">+ Add an Item</option>
          </select>
        </td>
        <td className="py-3 px-2">
          {isCustom ? (
            <input
              type="text"
              value={item.productName}
              onChange={(e) => handleChange('productName', e.target.value)}
              placeholder="Type product name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          ) : (
            <input
              type="text"
              value={item.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          )}
        </td>
        <td className="py-3 px-2 w-24">
          <input
            type="number"
            min="1"
            value={item.qty}
            onChange={(e) => handleChange('qty', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </td>
        <td className="py-3 px-2 w-32">
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.unitPrice}
            onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </td>
        <td className="py-3 px-2 w-32">
          <div className="text-right font-medium text-gray-900">
            {item.total.toFixed(2)}
          </div>
        </td>
        <td className="py-3 px-2 w-12">
          <button
            onClick={() => onRemove(index)}
            disabled={!canRemove}
            className={`p-2 rounded-lg transition-colors ${
              canRemove
                ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                : 'text-gray-200 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </td>
      </tr>

      <ProductQuickAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddProduct}
      />
    </>
  );
}
