import { createContext, useContext } from 'react';
import type { CartState } from './cart';

export interface CartContextValue {
  state: CartState;
  isOnline: boolean;
  subtotal: number;
  discount: number;
  cartTotal: number;
  cartCount: number;
  addToCart: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  applyDiscount: (code: string) => void;
  syncCartWithBackend: () => Promise<void>;
}
export const CartContext = createContext<CartContextValue | undefined>(undefined);
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart requiere CartProvider.');
  return context;
}
