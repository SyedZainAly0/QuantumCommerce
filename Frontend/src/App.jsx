import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './services/api';
import StoreFront from './pages/StoreFront';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Register from './components/Register';
import Login from './components/Login';
import UserDashboard from './components/userDashboard';
import AdminLayout from './Admin/AdminLayout';
import AdminHome from './Admin/AdminHome';
import ProductForm from './Admin/ProductForm';
import CategoryManager from './Admin/CategoryManager';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requiredRole }) => {
  const [auth, setAuth] = useState({ loading: true, user: null });

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setAuth({ loading: false, user: res.data }))
      .catch(() => setAuth({ loading: false, user: null }));
  }, []);

  if (auth.loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  if (!auth.user) return <Navigate to="/login" />;

  if (requiredRole && auth.user.role !== requiredRole) {
    return <Navigate to={auth.user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user'} />;
  }

  return children;
};

const RoleRedirect = () => {
  const [dest, setDest] = useState(null);
  useEffect(() => {
    api.get('/auth/me')
      .then(res => setDest(res.data.role === 'admin' ? '/dashboard/admin' : '/dashboard/user'))
      .catch(() => setDest('/login'));
  }, []);
  if (!dest) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );
  return <Navigate to={dest} />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login"    element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="products/add" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<ProductForm />} />
            <Route path="categories" element={<CategoryManager />} />
          </Route>

          {/* User Routes */}
          <Route
            path="/dashboard/user"
            element={
              <ProtectedRoute requiredRole="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route path="/dashboard" element={<RoleRedirect />} />

          {/* Public storefront — replaces the old Navigate to /login */}
          <Route path="/" element={<StoreFront />} />

        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;