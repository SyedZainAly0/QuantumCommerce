import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const tab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tab === 'orders' ? 'orders' : 'cart'
  );

  const guestCart = useCart();

  // USER
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get('/auth/me')).data,
    retry: false,
    onError: () => navigate('/login'),
  });

  // CART — stable sort by id prevents reordering on refetch
  const { data: cartItems = [], isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => (await api.get('/cart/')).data,
    enabled: activeTab === 'cart',
    select: (data) => [...data].sort((a, b) => a.id - b.id),
  });

  // ORDERS
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => (await api.get('/orders/')).data,
    enabled: activeTab === 'orders',
  });

  // SYNC GUEST CART
  useEffect(() => {
    const syncCart = async () => {
      if (guestCart.items.length === 0) return;

      try {
        for (const item of guestCart.items) {
          if (item.quantity === 0) continue;

          try {
            await api.post('/cart/', {
              product_id: item.product_id,
              quantity: item.quantity,
            });
          } catch (itemError) {
            console.warn(`Skipped syncing "${item.product?.name}": ${itemError?.response?.data?.detail}`);
          }
        }
        guestCart.clearCart();
        queryClient.invalidateQueries(['cart']);
      } catch (e) {
        console.error('Cart sync failed', e);
      }
    };

    syncCart();
  }, []);

  // UPDATE CART — optimistic update so quantity changes are instant with no reorder
  const updateCartMutation = useMutation({
    mutationFn: async ({ item_id, quantity }) =>
      (await api.put(`/cart/${item_id}`, { quantity })).data,

    onMutate: async ({ item_id, quantity }) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries(['cart']);

      // Snapshot current cache so we can roll back on error
      const previous = queryClient.getQueryData(['cart']);

      // Instantly update the quantity in the cache — no refetch, no reorder
      queryClient.setQueryData(['cart'], (old) =>
        old.map((item) =>
          item.id === item_id ? { ...item, quantity } : item
        )
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      // Roll back to the snapshot if the request fails
      queryClient.setQueryData(['cart'], context.previous);
      setLoadingItemId(null);
    },

    onSettled: () => {
      // Sync with server after success or error
      queryClient.invalidateQueries(['cart']);
      setLoadingItemId(null);
    },
  });

  // REMOVE ITEM
  const removeCartMutation = useMutation({
    mutationFn: async (id) => api.delete(`/cart/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['cart']),
  });

  // CHECKOUT
  const checkoutMutation = useMutation({
    mutationFn: async () => (await api.post('/orders/checkout')).data,
    onSuccess: () => {
      setCheckoutError(null);
      queryClient.invalidateQueries(['cart']);
      queryClient.invalidateQueries(['orders']);
      setActiveTab('orders');
      navigate('?tab=orders');
    },
    onError: (error) => {
      const message = error?.response?.data?.detail || 'Checkout failed. Please try again.';
      setCheckoutError(message);
    },
  });

  const handleLogout = async () => {
    await api.post('/auth/logout');
    navigate('/login');
  };

  // BILLING
  const subtotal = cartItems.reduce(
    (sum, i) => sum + (i.product?.price || 0) * i.quantity,
    0
  );
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`?tab=${tab}`);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { key: 'cart', label: `Cart (${cartItems.length})` },
    { key: 'orders', label: 'Orders' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">

      {/* SIDEBAR */}
      <aside className="w-56 bg-white border-r p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-6">Dashboard</h2>

        <div className="flex flex-col gap-2 flex-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition
                ${activeTab === t.key
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 text-sm text-gray-500 hover:text-red-500"
        >
          Logout
        </button>

        <button
          onClick={() => navigate('/')}
          className="ml-2 text-blue-600 hover:underline"
        >
          Go to store
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-6">

        {/* HEADER */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">Welcome back</p>
          <h1 className="text-lg font-semibold">{user.full_name}</h1>
        </div>

        {/* CART */}
        {activeTab === 'cart' && (
          <div className="max-w-2xl">
            <h2 className="text-md font-semibold mb-4">Your Cart</h2>

            {cartLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : cartItems.length === 0 ? (
              <div className="bg-white border rounded-xl p-8 text-center text-gray-500">
                Cart is empty
                <button
                  onClick={() => navigate('/')}
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Go to store
                </button>
              </div>
            ) : (
              <>
                {/* CART ITEMS */}
                <div className="bg-white border rounded-xl divide-y">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center p-4 gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {item.product?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${item.product?.price}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={loadingItemId === item.id}
                          onClick={() => {
                            setLoadingItemId(item.id);
                            updateCartMutation.mutate({
                              item_id: item.id,
                              quantity: item.quantity - 1,
                            });
                          }}
                          className="px-2 border rounded disabled:opacity-40"
                        >
                          -
                        </button>

                        <span>
                          {loadingItemId === item.id ? '...' : item.quantity}
                        </span>

                        <button
                          disabled={loadingItemId === item.id}
                          onClick={() => {
                            setLoadingItemId(item.id);
                            updateCartMutation.mutate({
                              item_id: item.id,
                              quantity: item.quantity + 1,
                            });
                          }}
                          className="px-2 border rounded disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeCartMutation.mutate(item.id)}
                        className="text-xs text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 bg-white border rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  {checkoutError && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
                      <span>⚠</span>
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setCheckoutError(null);
                      checkoutMutation.mutate();
                    }}
                    disabled={checkoutMutation.isLoading}
                    className={`w-full py-2 rounded-lg mt-3 text-white font-medium transition
    ${checkoutMutation.isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {checkoutMutation.isLoading ? 'Placing Order...' : 'Checkout'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div className="max-w-2xl">
            <h2 className="text-md font-semibold mb-4">My Orders</h2>

            {ordersLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-500">No orders yet</p>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border rounded-xl p-4"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Order #{order.id}</span>
                      <span className="text-sm text-gray-500">
                        ${order.total_price}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Status: {order.status}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Message: {order.Message}
                    </p>
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