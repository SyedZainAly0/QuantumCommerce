import React from 'react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ open, onClose, cartHook, isLoggedIn }) => {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, total, clearCart } = cartHook;

  const handleCheckout = () => {

    onClose();
    navigate(isLoggedIn ? '/dashboard/user?tab=cart' : '/login?next=checkout');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">


      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />


      <div className="relative flex flex-col w-[360px] max-w-[90vw] h-full bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-700 shadow-xl">

        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 tracking-wide">
            Cart
            <span className="ml-2 text-xs font-medium text-neutral-400 dark:text-neutral-500">
              ({items.length} {items.length === 1 ? 'item' : 'items'})
            </span>
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>


        <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-neutral-100 dark:divide-neutral-800">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="text-4xl mb-3">🛒</div>
              <p className="text-sm text-neutral-400 dark:text-neutral-500">Your cart is empty.</p>
            </div>
          ) : (
            items.map(item => (
              console.log(item),
              <div key={item.product_id} className="flex gap-3 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 mb-3">
                    ${item.product.price.toFixed(2)} each
                  </p>


                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.product_id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-base leading-none"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.product_id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-base leading-none"
                    >
                      +
                    </button>
                  </div>
                </div>


                <div className="flex flex-col items-end justify-between">
                  <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-neutral-200 dark:border-neutral-700 space-y-3 bg-white dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Subtotal</span>
              <span className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                ${total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isLoggedIn ? 'Go to checkout' : 'Login to checkout'}
            </button>

            <button
              onClick={clearCart}
              className="w-full py-2 text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;