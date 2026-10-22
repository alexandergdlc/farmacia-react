import { useEffect, useReducer, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cartReducer, initialState, KEY } from './cart';
import type { CartItem, CartState, Product } from './cart';
import { CartContext } from './useCart';

function isProduct(v: unknown): v is Product {
  if (!v || typeof v !== 'object') return false;
  const p = v as Product;
  return typeof p.id === 'string' && typeof p.name === 'string'
    && Number.isFinite(p.price) && p.price >= 0
    && Number.isInteger(p.stock) && p.stock >= 0;
}
function loadState(): CartState {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (!data || !Array.isArray(data.products)
        || !data.products.every(isProduct) || !Array.isArray(data.items)) {
      return initialState;
    }
    const products: Product[] = data.products;
    const items: unknown[] = data.items;
    const valid = items.every((v): v is CartItem => {
      if (!v || typeof v !== 'object') return false;
      const i = v as CartItem;
      const p = products.find(p => p.id === i.id);
      return !!p && Number.isInteger(i.quantity)
        && i.quantity > 0 && i.quantity <= p.stock;
    });
    if (!valid || new Set(products.map(p => p.id)).size !== products.length
        || new Set(items.map(i => i.id)).size !== items.length) {
      return initialState;
    }
    return { ...initialState, products, items,
      discountCode: data.discountCode === 'ESTUDIANTE10'
        ? data.discountCode : '' };
  } catch { return initialState; }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadState);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [storageError, setStorageError] = useState('');
  const syncLock = useRef(false);
  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ products: state.products,
        items: state.items, discountCode: state.discountCode }));
    } catch {
      // Notifica un fallo externo del almacenamiento del navegador.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageError('No se pudo guardar en este navegador.');
    }
  }, [state.products, state.items, state.discountCode]);

  const subtotal = state.items.reduce((sum, i) => sum + i.quantity *
    (state.products.find(p => p.id === i.id)?.price ?? 0), 0);
  const discount = state.discountCode ? Math.round(subtotal * 10) / 100 : 0;
  const cartTotal = Math.round((subtotal - discount) * 100) / 100;
  const cartCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  async function syncCartWithBackend() {
    if (syncLock.current || state.items.length === 0) return;
    if (!navigator.onLine) {
      dispatch({ type: 'SYNC_ERROR', message: 'Conectate para sincronizar.' });
      return;
    }
    syncLock.current = true;
    dispatch({ type: 'SYNC_START' });
    try {
      // Simulacion local: aqui se integraria una API real con fetch.
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (!navigator.onLine) throw new Error('Se perdio la conexion.');
      dispatch({ type: 'SYNC_OK' });
    } catch {
      dispatch({ type: 'SYNC_ERROR', message: 'No se sincronizo. Reintenta.' });
    } finally { syncLock.current = false; }
  }
  return <CartContext.Provider value={{ state, isOnline, subtotal, discount,
    cartTotal, cartCount, syncCartWithBackend,
    addToCart: id => dispatch({ type: 'ADD', id }),
    decreaseQuantity: id => dispatch({ type: 'DECREASE', id }),
    removeFromCart: id => dispatch({ type: 'REMOVE', id }),
    clearCart: () => dispatch({ type: 'CLEAR' }),
    applyDiscount: code => dispatch({ type: 'DISCOUNT', code }),
  }}>
    {storageError && <p role="alert">{storageError}</p>}
    {children}
  </CartContext.Provider>;
}
