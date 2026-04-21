import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'user'
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[cC][oO][mM]$/;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const validate = () => {
    let newErrors = {};

    if (!form.full_name || form.full_name.trim().length < 3) {
      newErrors.full_name = "Full name must be at least 3 characters";
    }

    if (!emailRegex.test(form.email)) {
      newErrors.email = "Email must be valid";
    }

    if (!passwordRegex.test(form.password)) {
      newErrors.password =
        "Password must be 8+ chars with uppercase, lowercase, number & special character";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setApiError('');

    if (!validate()) return;

    try {
      await api.post('/auth/register', form);

      const res = await api.post('/auth/login', {
        email: form.email,
        password: form.password
      });

      navigate(
        res.data.role === 'admin'
          ? '/dashboard/admin'
          : '/dashboard/user'
      );

    } catch (err) {
      setApiError(
        err.response?.data?.detail ||
        'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full max-w-md">

        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Create account
        </h2>


        {apiError && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <input
              type="text"
              placeholder="Full name"
              onChange={e =>
                setForm({ ...form, full_name: e.target.value })
              }
              className="w-full p-3 border border-gray-200 rounded-lg text-sm"
            />
            {errors.full_name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.full_name}
              </p>
            )}
          </div>


          <div>
            <input
              type="text"
              placeholder="Email (must end with .com)"
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


          <select
            onChange={e =>
              setForm({ ...form, role: e.target.value })
            }
            className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="user">User</option>
            <option value="admin" disabled>Admin</option>
          </select>

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-medium py-3 rounded-lg hover:bg-green-700 transition text-sm"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-gray-500 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-green-500 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;