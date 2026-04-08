import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const LOW_STOCK = 5;

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState(''); 
  // const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: 0, stock: 0, category_id: '' });
  const [catForm, setCatForm] = useState({ name: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.role !== 'admin') 
          { 
            navigate('/dashboard/user'); 
            return; 
          }
        setUser(res.data);
        await loadProducts();
        await loadCategories();
      } 
      catch { 
        navigate('/login'); 
      }
    };
    init();
  }, [navigate]);

  const loadProducts = async () => {
    const res = await api.get('/products/admin');
    setProducts(res.data);
  };
  
  const loadCategories = async () => {
    const res = await api.get('/products/categories');
    setCategories(res.data);
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: 0, stock: 0, category_id: '' });
    // setEditTarget(null);
    setView('list');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editTarget) {
        await api.post('/products/', form);
        setMsg(`"${form.name}" updated successfully.`);
      } else {
        await api.post('/products/', form);
        setMsg(`"${form.name}" added successfully.`);
      }
      await loadProducts();
      resetForm();
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Error saving product.');
    }
  };

  // const handleEdit = (p) => {
  //   console.log(p)
  //   console.log("Hello---------------1")
  //   setEditTarget(p);
  //   setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, category_id: p.category_id });
  //   setView('edit');
  // };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      setMsg(`"${p.name}" deleted.`);
      await loadProducts();
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Error deleting product.');
    }
  };

  // ── CATEGORY HANDLERS ──

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products/categories', catForm);
      setMsg(`Category "${catForm.name}" created.`);
      setCatForm({ name: '' });
      await loadCategories();
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Error creating category.');
    }
  };

  const handleLogout = async () => {
    await api.post('/auth/logout');
    navigate('/login');
  };

  if (!user) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  const lowStock = products.filter(p => p.stock <= LOW_STOCK);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">

      {/* ── Sidebar ── */}
      <aside className="w-52 bg-white border-r border-gray-200 flex flex-col py-4 shrink-0">
        <div className="px-4 mb-4 pb-4 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-800">Quantum</p>
          <p className="text-xs text-gray-400">Admin panel</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1 px-2">
          <button
            onClick={resetForm}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition
              ${view === 'list' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => { setForm({ name: '', description: '', price: 0, stock: 0, category_id: '' }); setView('add'); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition
              ${view === 'add' || view === 'edit' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Products
          </button>
          <button
            onClick={() => setView('categories')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition
              ${view === 'categories' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Categories
          </button>
        </nav>
        <div className="px-2 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Welcome back</p>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-800">{user.full_name}</h1>
              <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                admin
              </span>
            </div>
          </div>
          {view === 'list' && (
            <button
              onClick={() => setView('add')}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Add product
            </button>
          )}
          {view === 'categories' && (
            <span className="text-xs text-gray-400">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</span>
          )}
        </div>

        {/* Flash message */}
        {msg && (
          <div className="mb-4 text-sm bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg flex justify-between items-center">
            <span>{msg}</span>
            <button onClick={() => setMsg('')} className="text-green-400 hover:text-green-600 ml-4">✕</button>
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {view === 'list' && (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-400 mb-1">Total products</p>
                <p className="text-2xl font-semibold text-gray-800">{products.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-400 mb-1">Low stock</p>
                <p className="text-2xl font-semibold text-red-600">{lowStock.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-400 mb-1">Categories</p>
                <p className="text-2xl font-semibold text-gray-800">{categories.length}</p>
              </div>
            </div>

            {/* Low stock alert */}
            {lowStock.length > 0 && (
              <div className="mb-5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
                <p className="font-medium mb-1">⚠ Low stock alert</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  {lowStock.map(p => (
                    <li key={p.id}><strong>{p.name}</strong> — only {p.stock} left</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Products table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Your products</h2>
              </div>
              {products.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-gray-400">
                  No products yet. Click "+ Add product" to get started.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium">Name</th>
                      <th className="px-5 py-3 text-left font-medium">Category</th>
                      <th className="px-5 py-3 text-left font-medium">Price</th>
                      <th className="px-5 py-3 text-left font-medium">Stock</th>
                      <th className="px-5 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-5 py-3 font-medium text-gray-800">{p.name}</td>
                        <td className="px-5 py-3 text-gray-400">{p.category?.name || '—'}</td>
                        <td className="px-5 py-3 text-gray-700">${p.price.toFixed(2)}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            p.stock <= LOW_STOCK
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {p.stock} {p.stock <= LOW_STOCK ? '⚠' : ''}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/dashboard/admin/products/edit/${p.id}`)}
                              className="text-xs border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-100 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(p)}
                              className="text-xs border border-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-50 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ── ADD / EDIT FORM ── */}
        {(view === 'add') && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={resetForm} className="text-sm text-gray-400 hover:text-gray-600 transition">
                ← Back
              </button>
              <h2 className="text-lg font-semibold text-gray-800">
                Add new product
              </h2>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Product name</label>
                  <input
                    type="text" required placeholder="e.g. Wireless Mouse"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                  <textarea
                    required placeholder="Short product description"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Price ($)</label>
                    <input
                      type="number" required min="0" step="0.01"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Stock quantity</label>
                    <input
                      type="number" required min="0"
                      value={form.stock}
                      onChange={e => setForm({ ...form, stock: parseInt(e.target.value) })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <select
                    required
                    value={form.category_id}
                    onChange={e => setForm({ ...form, category_id: parseInt(e.target.value) })}
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
                    type="button" onClick={resetForm}
                    className="text-sm border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    {view === 'edit' ? 'Update product' : 'Add product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── CATEGORIES VIEW ── */}
        {view === 'categories' && (
          <div>
            {/* Add category form */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-lg mb-6">
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
                  className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                >
                  + Add category
                </button>
              </form>
            </div>

            {/* Categories table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-lg">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">All categories</h2>
              </div>
              {categories.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-gray-400">
                  No categories yet. Add one above.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium">ID</th>
                      <th className="px-5 py-3 text-left font-medium">Name</th>
                      <th className="px-5 py-3 text-left font-medium">Products</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(c => {
                      const count = products.filter(p => p.category_id === c.id).length;
                      return (
                        <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                          <td className="px-5 py-3 text-gray-400">#{c.id}</td>
                          <td className="px-5 py-3 font-medium text-gray-800">{c.name}</td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                              {count} product{count !== 1 ? 's' : ''}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;