import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [catForm, setCatForm] = useState({ name: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      setCategories(res.data);
    } catch (err) {
      setMsg('Error loading categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products/categories', catForm);
      setMsg(`Category "${catForm.name}" created successfully.`);
      setCatForm({ name: '' });
      await loadCategories();
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Error creating category.');
    }
  };

  // --- NEW DELETE HANDLER ---
  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? Warning: This might affect products linked to this category.`)) return;
    
    try {
      await api.delete(`/products/categories/${id}`);
      setMsg(`Category "${name}" deleted.`);
      await loadCategories(); // Refresh the list
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Error deleting category.');
    }
  };

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  if (loading) return <div className="text-sm text-gray-400">Loading categories...</div>;

  return (
    <div className="space-y-6">
      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm flex justify-between items-center shadow-sm">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-green-400 hover:text-green-600">✕</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-lg">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Add new category</h2>
        <form onSubmit={handleAddCategory} className="flex gap-3">
          <input
            type="text"
            required
            placeholder="e.g. Accessories"
            value={catForm.name}
            onChange={e => setCatForm({ name: e.target.value })}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add category
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-lg">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">All categories</h2>
        </div>
        {categories.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-400">
            No categories yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3 text-left font-medium">ID</th>
                <th className="px-5 py-3 text-left font-medium">Name</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-5 py-3 text-gray-400">#{c.id}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      className="text-xs border border-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;