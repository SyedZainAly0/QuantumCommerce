import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const LOW_STOCK_THRESHOLD = 5;

const AdminHome = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products/admin'),
          api.get('/products/categories')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || "Error deleting product");
    }
  };
  
  const lowStockProducts = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD);


  if (loading) return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />;

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Total products</p>
          <p className="text-2xl font-semibold text-gray-800">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Low stock</p>
          <p className="text-2xl font-semibold text-red-600">{lowStockProducts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Categories</p>
          <p className="text-2xl font-semibold text-gray-800">{categories.length}</p>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="mb-5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
          <p className="font-medium mb-1">⚠ Low stock alert</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            {lowStockProducts.map(p => (
              <li key={p.id}><strong>{p.name}</strong> — only {p.stock} left</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-700">Your products</h2>
          <button
            onClick={() => navigate('products/add')}
            className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
          >
            + Add product
          </button>
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
                  <td className="px-5 py-3 text-gray-400">
                    {p.category?.name || categories.find(c => c.id === p.category_id)?.name || '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-700">${p.price.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.stock <= LOW_STOCK_THRESHOLD
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {p.stock} {p.stock <= LOW_STOCK_THRESHOLD ? '⚠' : ''}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`products/edit/${p.id}`)}
                        className="text-xs border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-100 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
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
  );
};

export default AdminHome;