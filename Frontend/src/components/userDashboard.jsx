import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.role === 'admin') { navigate('/dashboard/admin'); return; }
        setUser(res.data);
        // GET /products/public — all products visible to users
        const prodRes = await api.get('/products/public');
        setProducts(prodRes.data);
      } catch { navigate('/login'); }
    };
    init();
  }, [navigate]);

  const handleLogout = async () => {
    await api.post('/auth/logout');
    navigate('/login');
  };

  if (!user) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
    </div>
  );

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const inStockCount = products.filter(p => p.stock > 0).length;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">

      {/* ── Sidebar ── */}
      <aside className="w-52 bg-white border-r border-gray-200 flex flex-col py-4 shrink-0">
        <div className="px-4 mb-4 pb-4 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-800">Quantum</p>
          <p className="text-xs text-gray-400">Store</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1 px-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left bg-green-50 text-green-700 font-medium">
            Browse
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left text-gray-500 hover:bg-gray-50 transition">
            My account
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
              <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
                user
              </span>
            </div>
          </div>
          {/* Search bar — filters locally, no extra API call */}
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 mb-1">Available products</p>
            <p className="text-2xl font-semibold text-gray-800">{products.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 mb-1">In stock</p>
            <p className="text-2xl font-semibold text-green-600">{inStockCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 mb-1">Out of stock</p>
            <p className="text-2xl font-semibold text-gray-400">{products.length - inStockCount}</p>
          </div>
        </div>

        {/* Product grid — GET /products/public */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">All products</h2>
          {search && (
            <p className="text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"</p>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-sm text-gray-400">
            {search ? `No products matching "${search}".` : 'No products available right now.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition"
              >
                {/* Category badge */}
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {p.category?.name || 'Uncategorized'}
                </span>

                <h3 className="mt-2 text-sm font-semibold text-gray-800">{p.name}</h3>
                <p className="text-xs text-gray-400 mt-1 mb-4 line-clamp-2">{p.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-blue-600">${p.price.toFixed(2)}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;