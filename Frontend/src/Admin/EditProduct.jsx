import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: ''
  });

  const [categories, setCategories] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadProduct();
    loadCategories();
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setForm(res.data);
    } catch {
      setMsg('Error loading product');
    }
  };

  const loadCategories = async () => {
    const res = await api.get('/products/categories');
    setCategories(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/products/${id}`, form);
      setMsg('Product updated successfully');
      setTimeout(() => navigate('/dashboard/admin'), 1000);
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Error updating product');
    }
  };

  const handleCancel = () => navigate('/dashboard/admin');

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button 
        onClick={handleCancel} 
        className="mb-4 text-sm text-gray-500 hover:text-gray-700 transition"
      >
        ← Back
      </button>

      <h2 className="text-lg font-semibold mb-4 text-gray-800">Edit Product</h2>

      {msg && (
        <div className="mb-4 text-sm bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg">
          {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-gray-200 p-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Product Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Wireless Mouse"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Short product description"
            rows={3}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Price ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Stock Quantity</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={e => setForm({ ...form, stock: parseInt(e.target.value) })}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select
            value={form.category_id}
            onChange={e => setForm({ ...form, category_id: parseInt(e.target.value) })}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select a category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Update Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;