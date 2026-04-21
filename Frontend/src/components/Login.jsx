import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { validateAuthForm } from '../utils/validation';


const Login = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();


  const validate = () => {
    const newErrors = validateAuthForm(form);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    try {
      const res = await api.post('/auth/login', form);

      navigate(
        res.data.role === 'admin'
          ? '/dashboard/admin'
          : '/dashboard/user'
      );

    } catch (err) {
      setApiError(
        err.response?.data?.detail || 'Invalid credentials'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full max-w-md">

        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Sign in
        </h2>

        {apiError && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg">
            {apiError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <input
              type="text"
              placeholder="Email (must end with .com)"
              value={form.email}
              onChange={e =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full p-3 border border-gray-200 rounded-lg text-sm"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full p-3 border border-gray-200 rounded-lg text-sm"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-gray-500 text-sm">
          No account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;