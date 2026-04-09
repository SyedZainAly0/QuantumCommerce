import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; // This is your axios instance

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    price: 0, 
    stock: 0, 
    category_id: '' 
  });
  const [loading, setLoading] = useState(false);

  // 1. Fetch Categories and (if editing) Product Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await api.get('/products/categories');
        setCategories(catRes.data);

        if (id) {
          const prodRes = await api.get(`/products/${id}`);
          setForm(prodRes.data);
        }
      } catch (err) {
        console.error("Axios Error:", err);
      }
    };
    fetchData();
  }, [id]);

  // 2. Handle Submit (POST for Add, PUT for Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        // Axios PUT request
        await api.put(`/products/${id}`, form);
      } else {
        // Axios POST request
        await api.post('/products/', form);
      }
      navigate('/dashboard/admin'); // Redirect back to list
    } catch (err) {
      const errorDetail = err.response?.data?.detail || "Error saving product";
      alert(errorDetail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 max-w-lg shadow-sm">
      <h2 className="text-lg font-bold text-gray-800 mb-6">
        {id ? 'Edit Product' : 'Add New Product'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Product Name</label>
          <input 
            type="text" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" 
            required 
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
          <textarea 
            value={form.description} 
            onChange={e => setForm({...form, description: e.target.value})} 
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none resize-none" 
            rows="3"
            required 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Price */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Price ($)</label>
            <input 
              type="number" 
              step="0.01"
              value={form.price} 
              onChange={e => setForm({...form, price: parseFloat(e.target.value)})} 
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" 
              required 
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Stock Quantity</label>
            <input 
              type="number" 
              value={form.stock} 
              onChange={e => setForm({...form, stock: parseInt(e.target.value)})} 
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" 
              required 
            />
          </div>
        </div>

        {/* Category Select */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select
            value={form.category_id}
            onChange={e => setForm({...form, category_id: parseInt(e.target.value)})}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none"
            required
          >
            <option value="">Select a category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
           <button 
             type="button" 
             onClick={() => navigate(-1)} 
             className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
           >
             Cancel
           </button>
           <button 
             type="submit" 
             disabled={loading}
             className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
           >
             {loading ? 'Saving...' : (id ? 'Update Product' : 'Add Product')}
           </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;