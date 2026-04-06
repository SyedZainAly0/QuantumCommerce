import React, { useState } from 'react';
import api from "../services/api"
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'user' 
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', formData);
      alert("Registration Successful! Please login.");
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.detail || "Registration Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-green-600 mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Full Name" 
            onChange={e => setFormData({...formData, full_name: e.target.value})} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required 
          />
          <input 
            type="email" 
            placeholder="Email" 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required 
          />
          <select 
            onChange={e => setFormData({...formData, role: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button 
            type="submit" 
            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition duration-300"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-green-500 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;