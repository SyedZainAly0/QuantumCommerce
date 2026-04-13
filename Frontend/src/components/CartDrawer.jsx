import React from 'react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ open, onClose, cartHook, isLoggedIn }) => {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, total, clearCart } = cartHook;

  const handleCheckout = () => {
    if (!isLoggedIn) {
      onClose();
      navigate('/login?next=checkout');
    } else {
      onClose();
      navigate('/dashboard/user?tab=cart');
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', justifyContent: 'flex-end'
    }}>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}
      />

      {/* drawer */}
      <div style={{
        position: 'relative', width: 360, maxWidth: '90vw',
        background: 'var(--color-background-primary)',
        borderLeft: '0.5px solid var(--color-border-tertiary)',
        display: 'flex', flexDirection: 'column', height: '100%'
      }}>
        {/* header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '0.5px solid var(--color-border-tertiary)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontWeight: 500, fontSize: 15, color: 'var(--color-text-primary)' }}>
            Cart ({items.length})
          </span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 20, color: 'var(--color-text-secondary)', lineHeight: 1
          }}>×</button>
        </div>

        {/* items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {items.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, textAlign: 'center', marginTop: 40 }}>
              Your cart is empty.
            </p>
          ) : items.map(item => (
            <div key={item.product_id} style={{
              display: 'flex', gap: 12, padding: '12px 0',
              borderBottom: '0.5px solid var(--color-border-tertiary)'
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {item.product.name}
                </p>
                <p style={{ margin: '2px 0 8px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  ${item.product.price.toFixed(2)} each
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => updateQty(item.product_id, item.quantity - 1)}
                    style={{ width: 24, height: 24, border: '0.5px solid var(--color-border-secondary)',
                      borderRadius: 4, background: 'none', cursor: 'pointer',
                      color: 'var(--color-text-primary)', fontSize: 14 }}>−</button>
                  <span style={{ fontSize: 13, minWidth: 20, textAlign: 'center',
                    color: 'var(--color-text-primary)' }}>{item.quantity}</span>
                  <button onClick={() => updateQty(item.product_id, item.quantity + 1)}
                    style={{ width: 24, height: 24, border: '0.5px solid var(--color-border-secondary)',
                      borderRadius: 4, background: 'none', cursor: 'pointer',
                      color: 'var(--color-text-primary)', fontSize: 14 }}>+</button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
                <button onClick={() => removeItem(item.product_id)}
                  style={{ fontSize: 12, color: 'var(--color-text-danger)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* footer */}
        {items.length > 0 && (
          <div style={{
            padding: '16px 20px',
            borderTop: '0.5px solid var(--color-border-tertiary)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Subtotal</span>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                ${total.toFixed(2)}
              </span>
            </div>
            <button onClick={handleCheckout} style={{
              width: '100%', padding: '10px 0',
              background: '#2563eb', color: '#fff', border: 'none',
              borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer'
            }}>
              {isLoggedIn ? 'Go to checkout' : 'Login to checkout'}
            </button>
            <button onClick={clearCart} style={{
              width: '100%', padding: '8px 0', marginTop: 8,
              background: 'none', border: '0.5px solid var(--color-border-secondary)',
              borderRadius: 8, fontSize: 13, color: 'var(--color-text-secondary)', cursor: 'pointer'
            }}>
              Clear cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;