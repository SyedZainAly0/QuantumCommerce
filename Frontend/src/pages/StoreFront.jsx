import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CartDrawer from '../components/CartDrawer';
import { useCart } from '../hooks/useCart';
import { BASEURL } from '../utils/Constant';


const StoreFront = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  const cartHook = useCart();
  const { addItem, count } = cartHook;

  const { data: authUser } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get('/auth/me')).data,
    retry: false,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['public-products'],
    queryFn: async () => (await api.get('/products/public')).data,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/products/categories')).data,
  });

  const handleAddToCart = (product) => {
    addItem(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name || '').toLowerCase().includes(search.toLowerCase());

    const matchCat =
      selectedCategory === 'all' ||
      p.category_id === parseInt(selectedCategory);

    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedProducts = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-gray-200 px-8 h-16 flex items-center justify-between">
      
        <div onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
            Q
          </div>
          <span className="text-base font-semibold text-gray-800 group-hover:text-black transition">
            Quantum
          </span>
        </div>

        <div className="flex items-center gap-3">

          {authUser ? (
            <button
              onClick={() =>
                navigate(
                  authUser.role === 'admin'
                    ? '/dashboard/admin'
                    : '/dashboard/user'
                )
              }
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-gray-600 hover:text-gray-900 transition"
              >
                Login
              </button>

              <button
                onClick={() => navigate('/register')}
                className="text-sm px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:shadow-md transition"
              >
                Register
              </button>
            </>
          )}
          
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-white transition"
          >
            🛒 Cart

            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full shadow">
                {count}
              </span>
            )}
          </button>

        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-8 py-6 flex gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-64 md:w-80 text-sm bg-white border border-gray-300 rounded-lg px-4 py-2.5 
  shadow-sm placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
  transition"
        />

        <select
          className="border-b border-gray-300 text-sm"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* PRODUCTS */}
      <div className="max-w-7xl mx-auto px-8 pb-16">

        {isLoading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">

            {paginatedProducts.map(p => (
              <div key={p.id} className="group cursor-pointer">

                {/* IMAGE */}
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
                  {p.image ? (
                    <img
                      src={`${BASEURL}${p.image}`} 
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No Image
                    </div>
                  )}
                </div>

                {/* INFO */}
                <h3 className="text-sm font-medium text-gray-800 group-hover:text-black">
                  {p.name}
                </h3>

                <p className="text-sm text-gray-500">
                  ${p.price.toFixed(2)}
                </p>

                {/* ACTION */}
                <button
                  onClick={() => handleAddToCart(p)}
                  className={`mt-2 text-xs ${addedId === p.id
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-black'
                    }`}
                >
                  {addedId === p.id ? 'Added ✓' : 'Add to cart'}
                </button>

              </div>
            ))}

          </div>
        )}

        {/* PAGINATION */}
        <div className="flex justify-center mt-10 gap-4 text-sm">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>
          <span>{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>

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