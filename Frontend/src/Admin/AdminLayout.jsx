import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminLayout = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleLogout = async () => {
    await api.post('/auth/logout');
    navigate('/login');
  };

  if (!user) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className="w-52 bg-white border-r border-gray-200 flex flex-col py-4 shrink-0">
        <div className="px-4 mb-4 pb-4 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-800">Quantum</p>
          <p className="text-xs text-gray-400">Admin panel</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1 px-2">
          <NavLink to="/dashboard/admin" end className={({isActive}) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${isActive ? 'bg-red-50 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
            Dashboard
          </NavLink>
          <NavLink to="/dashboard/admin/products/add" className={({isActive}) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${isActive ? 'bg-red-50 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
            Add Product
          </NavLink>
          <NavLink to="/dashboard/admin/categories" className={({isActive}) => `px-3 py-2 rounded-lg text-sm transition ${isActive ? 'bg-red-50 text-blue-700 font-medium' : 'text-gray-500'}`}>
            Categories
          </NavLink>
        </nav>
        <div className="px-2 mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-gray-800">Welcome, {user.full_name}</h1>
        </header>
    
        <Outlet context={{ user }} /> 
      
      </main>
    </div>
  );
};

export default AdminLayout;