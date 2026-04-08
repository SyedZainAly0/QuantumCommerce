import React, { useEffect, useState } from 'react';
import api from "../services/api";
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {

  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get current user (from cookie)
        const res = await api.get('/auth/me');
        setUser(res.data);

        // 2. If admin → fetch admin products
        if (res.data.role === "admin") {
          const prodRes = await api.get('/products/admin');
          setProducts(prodRes.data);
        }

      } catch (err) {
        navigate('/login');
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await api.post('/auth/logout');
    navigate('/login');
  };

  if (!user) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <header className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Hello {user.full_name}, Welcome to {user.role === "admin" ? "Admin" : "User"} Dashboard!
          </h1>
          <button 
            onClick={handleLogout} 
            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200"
          >
            Logout
          </button>
        </header>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p>User ID</p>
            <p className="font-bold">{user.user_id}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p>Role</p>
            <p className="font-bold">{user.role}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p>Status</p>
            <p className="font-bold text-green-600">{user.status}</p>
          </div>
        </div>

        {/* ADMIN SECTION */}
        {user.role === "admin" && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Your Products</h2>

            {products.length === 0 ? (
              <p>No products yet</p>
            ) : (
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="text-center border-t">
                      <td>{p.name}</td>
                      <td>{p.price}</td>
                      <td>{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;