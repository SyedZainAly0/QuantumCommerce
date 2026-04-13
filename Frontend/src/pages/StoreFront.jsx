import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CartDrawer from '../components/CartDrawer';
import { useCart } from '../hooks/useCart';

const StoreFront = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const cartHook = useCart();
  const { addItem, count } = cartHook;

  // Check if user is already logged in
  const { data: authUser } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data;
    },
    retry: false,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['public-products'],
    queryFn: async () => {
      const res = await api.get('/products/public');
      return res.data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/products/categories');
      return res.data;
    },
  });

  const handleAddToCart = (product) => {
    addItem(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'all' || p.category_id === parseInt(selectedCategory);
    return matchSearch && matchCat;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background-tertiary)', fontFamily: 'var(--font-sans)' }}>
      {/* Navbar */}
      <nav style={{
        background: 'var(--color-background-primary)',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 40
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 500, fontSize: 16, color: 'var(--color-text-primary)' }}>Quantum</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Store</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {authUser ? (
            <button onClick={() => navigate(authUser.role === 'admin' ? '/dashboard/admin' : '/dashboard/user')}
              style={{ fontSize: 13, padding: '6px 14px', border: '0.5px solid var(--color-border-secondary)',
                borderRadius: 8, background: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
              Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')}
                style={{ fontSize: 13, padding: '6px 14px', border: '0.5px solid var(--color-border-secondary)',
                  borderRadius: 8, background: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
                Login
              </button>
              <button onClick={() => navigate('/register')}
                style={{ fontSize: 13, padding: '6px 14px', background: '#2563eb',
                  color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                Register
              </button>
            </>
          )}
          <button onClick={() => setCartOpen(true)} style={{
            position: 'relative', padding: '6px 14px',
            border: '0.5px solid var(--color-border-secondary)',
            borderRadius: 8, background: 'none', cursor: 'pointer',
            fontSize: 13, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6
          }}>
            Cart
            {count > 0 && (
              <span style={{
                background: '#2563eb', color: '#fff', borderRadius: '999px',
                fontSize: 11, fontWeight: 500, padding: '1px 6px', minWidth: 18, textAlign: 'center'
              }}>{count}</span>
            )}
          </button>
        </div>
      </nav>

    
      <div style={{
        background: 'var(--color-background-primary)',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        padding: '12px 24px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            border: '0.5px solid var(--color-border-secondary)',
            borderRadius: 8, padding: '7px 12px', fontSize: 13,
            width: 220, background: 'var(--color-background-primary)',
            color: 'var(--color-text-primary)', outline: 'none'
          }}
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          style={{
            border: '0.5px solid var(--color-border-secondary)',
            borderRadius: 8, padding: '7px 12px', fontSize: 13,
            background: 'var(--color-background-primary)',
            color: 'var(--color-text-primary)', outline: 'none'
          }}
        >
          <option value="all">All categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Product grid */}
      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{
              width: 36, height: 36, border: '2px solid #2563eb',
              borderTopColor: 'transparent', borderRadius: '50%',
              animation: 'spin 0.7s linear infinite'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 12, padding: '60px 0', textAlign: 'center',
            color: 'var(--color-text-secondary)', fontSize: 14
          }}>
            No products found.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 16
          }}>
            {filtered.map(p => (
              <div key={p.id} style={{
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 12, padding: 16,
                display: 'flex', flexDirection: 'column', gap: 8
              }}>
                <span style={{
                  fontSize: 11, background: 'var(--color-background-secondary)',
                  color: 'var(--color-text-secondary)', padding: '3px 8px',
                  borderRadius: 999, alignSelf: 'flex-start'
                }}>
                  {p.category?.name || 'Uncategorized'}
                </span>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {p.name}
                </h3>
                <p style={{
                  margin: 0, fontSize: 12, color: 'var(--color-text-secondary)',
                  flex: 1, overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                }}>
                  {p.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 500, color: '#2563eb' }}>
                    ${p.price.toFixed(2)}
                  </span>
                  <span style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 999,
                    background: p.stock > 0 ? '#dcfce7' : '#fee2e2',
                    color: p.stock > 0 ? '#166534' : '#991b1b'
                  }}>
                    {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <button
                  disabled={p.stock === 0}
                  onClick={() => handleAddToCart(p)}
                  style={{
                    width: '100%', padding: '8px 0', marginTop: 4,
                    background: addedId === p.id ? '#16a34a' : p.stock === 0 ? 'var(--color-background-secondary)' : '#2563eb',
                    color: p.stock === 0 ? 'var(--color-text-secondary)' : '#fff',
                    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500,
                    cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  {addedId === p.id ? 'Added!' : p.stock === 0 ? 'Out of stock' : 'Add to cart'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartHook={cartHook}
        isLoggedIn={!!authUser}
      />
    </div>
  );
};

export default StoreFront;