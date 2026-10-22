export interface Product {
  id: string; name: string; price: number; stock: number;
}
export interface CartItem {
  id: string; quantity: number;
}
export interface CartState {
  products: Product[];
  items: CartItem[];
  discountCode: string;
  isSyncing: boolean;
  message: string;
}
export const KEY = 'farmacia_lab06_v1';
export const initialState: CartState = {
  products: [
    { id: 'p1', name: 'Paracetamol 500 mg', price: 2.5, stock: 5 },
    { id: 'p2', name: 'Alcohol 70 grados', price: 6.5, stock: 2 },
    { id: 'p3', name: 'Gasa esteril', price: 4, stock: 0 },
  ],
  items: [], discountCode: '', isSyncing: false, message: '',
};
export type CartAction =
  | { type: 'ADD' | 'DECREASE' | 'REMOVE'; id: string }
  | { type: 'CLEAR' | 'SYNC_START' | 'SYNC_OK' }
  | { type: 'DISCOUNT'; code: string }
  | { type: 'SYNC_ERROR'; message: string };

export function cartReducer(s: CartState, a: CartAction): CartState {
  if (s.isSyncing && a.type !== 'SYNC_OK' && a.type !== 'SYNC_ERROR') {
    return s;
  }
  switch (a.type) {
    case 'ADD': {
      const p = s.products.find(p => p.id === a.id);
      const item = s.items.find(i => i.id === a.id);
      if (!p || (item?.quantity ?? 0) >= p.stock) {
        return { ...s, message: 'No hay mas stock disponible.' };
      }
      const items = item
        ? s.items.map(i => i.id === a.id
          ? { ...i, quantity: i.quantity + 1 } : i)
        : [...s.items, { id: a.id, quantity: 1 }];
      return { ...s, items, message: '' };
    }
    case 'DECREASE':
      return { ...s, message: '', items: s.items
        .map(i => i.id === a.id ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0) };
    case 'REMOVE':
      return { ...s, items: s.items.filter(i => i.id !== a.id), message: '' };
    case 'CLEAR':
      return { ...s, items: [], discountCode: '', message: 'Carrito vaciado.' };
    case 'DISCOUNT':
      return { ...s,
        discountCode: a.code === 'ESTUDIANTE10' ? a.code : '',
        message: a.code === 'ESTUDIANTE10'
          ? 'Descuento del 10 % aplicado.' : 'Codigo no valido.' };
    case 'SYNC_START':
      return { ...s, isSyncing: true, message: 'Sincronizando...' };
    case 'SYNC_OK':
      return { ...s, products: s.products.map(p => ({ ...p,
        stock: p.stock - (s.items.find(i => i.id === p.id)?.quantity ?? 0),
      })), items: [], discountCode: '', isSyncing: false,
      message: 'Simulacion completada. Inventario local actualizado.' };
    case 'SYNC_ERROR':
      return { ...s, isSyncing: false, message: a.message };
    default:
      return s;
  }
}
