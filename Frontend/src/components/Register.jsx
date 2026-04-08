import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState(
    { 
      full_name: '',
      email: '', 
      password: '', 
      role: 'user' 
    });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      // Auto-login so we can redirect by role immediately
      const res = await api.post('/auth/login', { email: form.email, password: form.password });
      navigate(res.data.role === 'admin' ? '/dashboard/admin' : '/dashboard/user');
    } catch (err) {
      alert(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Create account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full name" onChange={e => setForm({ ...form, full_name: e.target.value })}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" required />
          <input type="email" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" required />
          <input type="password" placeholder="Password (min 8 chars)" onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" required />
          <select onChange={e => setForm({ ...form, role: e.target.value })}
            className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-400">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit"
            className="w-full bg-green-600 text-white font-medium py-3 rounded-lg hover:bg-green-700 transition text-sm">
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-gray-500 text-sm">
          Already have an account? <Link to="/login" className="text-green-500 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;