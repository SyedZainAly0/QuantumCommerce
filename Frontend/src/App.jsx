import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/userDashboard';
import api from './services/api';
import EditProduct from './components/EditProduct';


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
  if (!dest) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  return <Navigate to={dest} />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login"    element={<Login />} />

        <Route path="/dashboard/admin" element={
          <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
        } />

        
        <Route path="/dashboard/user" element={
          <ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>
        } />

        {/* fallback /dashboard → role redirect */}
        <Route path="/dashboard" element={<RoleRedirect />} />
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/dashboard/admin/products/edit/:id" element={
           <ProtectedRoute requiredRole="admin">
           <EditProduct />
       </ProtectedRoute>
}        />
      </Routes>
    </Router>
  );
}

export default App;