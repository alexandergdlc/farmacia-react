import { useState } from 'react';
import { CartProvider } from './CartProvider';
import { useCart } from './useCart';

function ProductList() {
  const { state, addToCart } = useCart();
  return <section><h2>Catalogo de farmacia</h2>
    {state.products.map(p => {
      const quantity = state.items.find(i => i.id === p.id)?.quantity ?? 0;
      return <article key={p.id}>
        <h3>{p.name}</h3>
        <p>S/ {p.price.toFixed(2)} | Stock: {p.stock}</p>
        <button disabled={state.isSyncing || quantity >= p.stock}
          onClick={() => addToCart(p.id)}>
          {p.stock === 0 ? 'Sin stock' : quantity >= p.stock
            ? 'Limite de stock' : 'Agregar'}
        </button>
      </article>;
    })}
  </section>;
}
function ShoppingCart() {
  const cart = useCart();
  const [code, setCode] = useState('');
  return <section><h2>Carrito ({cart.cartCount} unidades)</h2>
    <p>{cart.isOnline ? 'En linea' : 'Modo sin conexion'}</p>
    {cart.state.items.length === 0 && <p>El carrito esta vacio.</p>}
    {cart.state.items.map(i => {
      const p = cart.state.products.find(p => p.id === i.id)!;
      return <article key={i.id}>
        <h3>{p.name}</h3>
        <p>S/ {p.price.toFixed(2)} x {i.quantity}</p>
        <div className="actions">
          <button disabled={cart.state.isSyncing}
            onClick={() => cart.decreaseQuantity(i.id)}>-</button>
          <span>{i.quantity}</span>
          <button disabled={cart.state.isSyncing || i.quantity >= p.stock}
            onClick={() => cart.addToCart(i.id)}>+</button>
          <button disabled={cart.state.isSyncing}
            onClick={() => cart.removeFromCart(i.id)}>Eliminar</button>
        </div>
      </article>;
    })}
    <form onSubmit={e => { e.preventDefault(); cart.applyDiscount(code); }}>
      <label>Cupon <input value={code} disabled={cart.state.isSyncing}
        onChange={e => setCode(e.target.value)} /></label>
      <button disabled={cart.state.isSyncing}>Aplicar descuento</button>
    </form>
    <p>Subtotal: S/ {cart.subtotal.toFixed(2)}</p>
    <p>Descuento: S/ {cart.discount.toFixed(2)}</p>
    <h3>Total: S/ {cart.cartTotal.toFixed(2)}</h3>
    <p role="status">{cart.state.message}</p>
    <div className="actions">
      <button disabled={cart.state.isSyncing || !cart.cartCount}
        onClick={cart.clearCart}>Vaciar</button>
      <button disabled={!cart.isOnline || cart.state.isSyncing || !cart.cartCount}
        onClick={() => void cart.syncCartWithBackend()}>
        {cart.state.isSyncing ? 'Sincronizando...' : 'Sincronizar compra'}
      </button>
    </div>
    <small>Sincronizacion simulada. Actualiza solo el inventario local.</small>
  </section>;
}
export default function App() {
  return <CartProvider><main>
    <h1>Laboratorio 06 Estado complejo contexto y custom hooks</h1>
    <p>Carrito de farmacia con persistencia y descuento estudiantil.</p>
    <div className="layout"><ProductList /><ShoppingCart /></div>
  </main></CartProvider>;
}
