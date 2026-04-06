import React, { useEffect, useState } from 'react';
import api from "../services/api"
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (err) {
        navigate('/login');
      }
    };
    fetchUser();
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
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.full_name || 'User'}!</h1>
          <button 
            onClick={handleLogout} 
            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition"
          >
            Logout
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-blue-500">
            <p className="text-gray-500 text-sm uppercase">User ID</p>
            <p className="text-lg font-mono font-bold text-gray-800">{user.user_id}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-purple-500">
            <p className="text-gray-500 text-sm uppercase">Role</p>
            <p className="text-lg font-bold text-gray-800 capitalize">{user.role}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-green-500">
            <p className="text-gray-500 text-sm uppercase">Status</p>
            <p className="text-lg font-bold text-green-600">{user.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;