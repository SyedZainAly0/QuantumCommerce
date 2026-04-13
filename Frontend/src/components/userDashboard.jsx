import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'cart' ? 'cart' : 'browse');
  const [search, setSearch] = useState('');
  const guestCart = useCart();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data;
    },
    retry: false,
    onError: () => navigate('/login'),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['public-products'],
    queryFn: async () => (await api.get('/products/public')).data,
  });

  const { data: cartItems = [], isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => (await api.get('/cart/')).data,
    enabled: activeTab === 'cart',
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => (await api.get('/orders/')).data,
    enabled: activeTab === 'orders',
  });

  // Sync guest cart → backend on mount
  useEffect(() => {
    const syncCart = async () => {
      if (guestCart.items.length === 0) return;
      try {
        for (const item of guestCart.items) {
          await api.post('/cart/', { product_id: item.product_id, quantity: item.quantity });
        }
        guestCart.clearCart();
        queryClient.invalidateQueries(['cart']);
      } catch (e) {
        console.error('Cart sync failed', e);
      }
    };
    syncCart();
  }, []); // eslint-disable-line

  const addToCartMutation = useMutation({
    mutationFn: async ({ product_id, quantity }) =>
      (await api.post('/cart/', { product_id, quantity })).data,
    onSuccess: () => queryClient.invalidateQueries(['cart']),
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({ item_id, quantity }) =>
      (await api.put(`/cart/${item_id}`, { quantity })).data,
    onSuccess: () => queryClient.invalidateQueries(['cart']),
  });

  const removeCartMutation = useMutation({
    mutationFn: async (item_id) => api.delete(`/cart/${item_id}`),
    onSuccess: () => queryClient.invalidateQueries(['cart']),
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => (await api.post('/orders/checkout')).data,
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['public-products']);
      setActiveTab('orders');
    },
    onError: (err) => alert(err.response?.data?.detail || 'Checkout failed'),
  });

  const handleLogout = async () => {
    await api.post('/auth/logout');
    navigate('/login');
  };

  const cartTotal = cartItems.reduce(
    (sum, i) => sum + (i.product?.price || 0) * i.quantity, 0
  );

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const [addedId, setAddedId] = useState(null);
  const handleAddToCart = (product) => {
    addToCartMutation.mutate({ product_id: product.id, quantity: 1 });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
    setActiveTab('cart');
  };

  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: 36, height: 36, border: '2px solid #16a34a', borderTopColor: 'transparent',
        borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const tabs = [
    { key: 'browse', label: 'Browse' },
    { key: 'cart', label: `Cart${cartItems.length > 0 ? ` (${cartItems.length})` : ''}` },
    { key: 'orders', label: 'My orders' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--color-background-tertiary)', fontFamily: 'var(--font-sans)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 208, background: 'var(--color-background-primary)',
        borderRight: '0.5px solid var(--color-border-tertiary)',
        display: 'flex', flexDirection: 'column', padding: '16px 0', flexShrink: 0
      }}>
        <div style={{ padding: '0 16px 16px', borderBottom: '0.5px solid var(--color-border-tertiary)', marginBottom: 8 }}>
          <p style={{ margin: 0, fontWeight: 500, fontSize: 14, color: 'var(--color-text-primary)' }}>Quantum</p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>Store</p>
        </div>
        <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{
                textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: activeTab === t.key ? 500 : 400,
                background: activeTab === t.key ? '#eff6ff' : 'none',
                color: activeTab === t.key ? '#1d4ed8' : 'var(--color-text-secondary)'
              }}>{t.label}</button>
          ))}
        </nav>
        <div style={{ padding: '0 8px' }}>
          <button onClick={handleLogout} style={{
            width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8,
            border: 'none', cursor: 'pointer', fontSize: 13,
            background: 'none', color: 'var(--color-text-secondary)'
          }}>Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: '0 0 2px', fontSize: 12, color: 'var(--color-text-secondary)' }}>Welcome back</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {user.full_name}
            </h1>
            <span style={{ fontSize: 11, background: '#dcfce7', color: '#166534',
              padding: '2px 8px', borderRadius: 999 }}>user</span>
          </div>
        </div>

        {/* BROWSE TAB */}
        {activeTab === 'browse' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Available products', value: products.length, color: 'var(--color-text-primary)' },
                { label: 'In stock', value: products.filter(p => p.stock > 0).length, color: '#16a34a' },
                { label: 'Out of stock', value: products.filter(p => p.stock === 0).length, color: 'var(--color-text-secondary)' },
              ].map(m => (
                <div key={m.label} style={{
                  background: 'var(--color-background-primary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 10, padding: '14px 16px'
                }}>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--color-text-secondary)' }}>{m.label}</p>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 500, color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>
            <input type="text" placeholder="Search products..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: '0.5px solid var(--color-border-secondary)', borderRadius: 8,
                padding: '8px 12px', fontSize: 13, width: 240, marginBottom: 16,
                background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', outline: 'none'
              }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {filtered.map(p => (
                <div key={p.id} style={{
                  background: 'var(--color-background-primary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 6
                }}>
                  <span style={{ fontSize: 11, background: 'var(--color-background-secondary)',
                    color: 'var(--color-text-secondary)', padding: '2px 7px', borderRadius: 999, alignSelf: 'flex-start' }}>
                    {p.category?.name || 'Uncategorized'}
                  </span>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{p.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', flex: 1 }}>{p.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#2563eb' }}>${p.price.toFixed(2)}</span>
                    <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999,
                      background: p.stock > 0 ? '#dcfce7' : '#fee2e2',
                      color: p.stock > 0 ? '#166534' : '#991b1b' }}>
                      {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <button disabled={p.stock === 0} onClick={() => handleAddToCart(p)}
                    style={{
                      padding: '7px 0', marginTop: 2,
                      background: addedId === p.id ? '#16a34a' : p.stock === 0 ? 'var(--color-background-secondary)' : '#2563eb',
                      color: p.stock === 0 ? 'var(--color-text-secondary)' : '#fff',
                      border: 'none', borderRadius: 8, fontSize: 13, cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s'
                    }}>
                    {addedId === p.id ? 'Added!' : p.stock === 0 ? 'Out of stock' : 'Add to cart'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CART TAB */}
        {activeTab === 'cart' && (
          <div style={{ maxWidth: 640 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              Your cart
            </h2>
            {cartLoading ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Loading cart...</p>
            ) : cartItems.length === 0 ? (
              <div style={{
                background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 12, padding: '48px 0', textAlign: 'center',
                color: 'var(--color-text-secondary)', fontSize: 14
              }}>
                Your cart is empty.{' '}
                <button onClick={() => setActiveTab('browse')}
                  style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 14 }}>
                  Browse products
                </button>
              </div>
            ) : (
              <>
                <div style={{
                  background: 'var(--color-background-primary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 12, overflow: 'hidden', marginBottom: 16
                }}>
                  {cartItems.map((item, i) => (
                    <div key={item.id} style={{
                      padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center',
                      borderTop: i > 0 ? '0.5px solid var(--color-border-tertiary)' : 'none'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {item.product?.name}
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                          ${item.product?.price?.toFixed(2)} each
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={() => updateCartMutation.mutate({ item_id: item.id, quantity: item.quantity - 1 })}
                          disabled={item.quantity <= 1}
                          style={{ width: 26, height: 26, border: '0.5px solid var(--color-border-secondary)',
                            borderRadius: 4, background: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}>−</button>
                        <span style={{ fontSize: 14, minWidth: 20, textAlign: 'center', color: 'var(--color-text-primary)' }}>
                          {item.quantity}
                        </span>
                        <button onClick={() => updateCartMutation.mutate({ item_id: item.id, quantity: item.quantity + 1 })}
                          style={{ width: 26, height: 26, border: '0.5px solid var(--color-border-secondary)',
                            borderRadius: 4, background: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}>+</button>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', minWidth: 60, textAlign: 'right' }}>
                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </span>
                      <button onClick={() => removeCartMutation.mutate(item.id)}
                        style={{ fontSize: 12, color: 'var(--color-text-danger)', background: 'none',
                          border: 'none', cursor: 'pointer', padding: 0 }}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div style={{
                  background: 'var(--color-background-primary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 12, padding: '16px 18px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
                      Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => checkoutMutation.mutate()}
                    disabled={checkoutMutation.isPending}
                    style={{
                      width: '100%', padding: '10px 0',
                      background: checkoutMutation.isPending ? 'var(--color-background-secondary)' : '#2563eb',
                      color: checkoutMutation.isPending ? 'var(--color-text-secondary)' : '#fff',
                      border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer'
                    }}>
                    {checkoutMutation.isPending ? 'Placing order...' : 'Place order'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div style={{ maxWidth: 700 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              My orders
            </h2>
            {ordersLoading ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div style={{
                background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 12, padding: '48px 0', textAlign: 'center',
                color: 'var(--color-text-secondary)', fontSize: 14
              }}>
                No orders yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {orders.map(order => (
                  <div key={order.id} style={{
                    background: 'var(--color-background-primary)',
                    border: '0.5px solid var(--color-border-tertiary)',
                    borderRadius: 12, overflow: 'hidden'
                  }}>
                    <div style={{
                      padding: '12px 18px', borderBottom: '0.5px solid var(--color-border-tertiary)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          Order #{order.id}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginLeft: 10 }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          fontSize: 11, padding: '3px 8px', borderRadius: 999,
                          background: order.status === 'confirmed' ? '#dcfce7' : '#fef9c3',
                          color: order.status === 'confirmed' ? '#166534' : '#854d0e'
                        }}>
                          {order.status}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          ${order.total_price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: '10px 18px' }}>
                      {order.items.map(item => (
                        <div key={item.id} style={{
                          display: 'flex', justifyContent: 'space-between',
                          padding: '6px 0', fontSize: 13, color: 'var(--color-text-secondary)'
                        }}>
                          <span>{item.product_name} × {item.quantity}</span>
                          <span>${(item.product_price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;