import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import VoiceCartAssistant from '../../components/cart/VoiceCartAssistant';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft, 
  CreditCard,
  Package
} from 'lucide-react';

const Cart = () => {
  const { 
    items, 
    totalItems, 
    totalAmount, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Redirigir al login si no está autenticado
      navigate('/login');
      return;
    }
    
    // Redirigir al checkout
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Asistente de voz incluso cuando el carrito está vacío */}
        <div className="max-w-2xl mx-auto mb-12">
          <VoiceCartAssistant />
        </div>

        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-8">
            ¡Agrega algunos productos increíbles a tu carrito!
          </p>
          <Link
            to="/products"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center space-x-2"
          >
            <Package className="h-5 w-5" />
            <span>Explorar Productos</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
          <p className="text-gray-600 mt-1">
            {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu carrito
          </p>
        </div>
        
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Seguir comprando</span>
        </button>
      </div>

      {/* Asistente de Voz NLP */}
      <div className="mb-8">
        <VoiceCartAssistant />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onQuantityChange={handleQuantityChange}
              onRemove={removeFromCart}
            />
          ))}
          
          {/* Botón para limpiar carrito */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-800 font-medium transition-colors flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Vaciar carrito</span>
            </button>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <OrderSummary
            totalAmount={totalAmount}
            totalItems={totalItems}
            onCheckout={handleCheckout}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </div>
  );
};

// Componente para cada item del carrito
const CartItem = ({ item, onQuantityChange, onRemove }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-shadow hover:shadow-lg">
      <div className="flex items-center space-x-4">
        {/* Imagen del producto */}
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
              }}
            />
          ) : (
            <Package className="h-8 w-8 text-gray-400" />
          )}
        </div>

        {/* Información del producto */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            <Link 
              to={`/products/${item.id}`}
              className="hover:text-indigo-600 transition-colors"
            >
              {item.name}
            </Link>
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mt-1">
            {item.description}
          </p>
          <p className="text-indigo-600 font-semibold text-lg mt-2">
            ${parseFloat(item.price).toFixed(2)}
          </p>
        </div>

        {/* Controles de cantidad */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          
          <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
            {item.quantity}
          </span>
          
          <button
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Subtotal y botón eliminar */}
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900 mb-2">
            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
          </p>
          <button
            onClick={() => onRemove(item.id)}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Eliminar producto"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente resumen del pedido
const OrderSummary = ({ totalAmount, totalItems, onCheckout, isAuthenticated }) => {
  const shipping = 0; // Envío gratis
  const tax = totalAmount * 0.13; // IVA 13%
  const finalTotal = totalAmount + shipping + tax;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen del Pedido</h2>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({totalItems} productos)</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>Envío</span>
          <span className="text-green-600 font-medium">Gratis</span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>IVA (13%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Información de envío */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-2">Información de envío</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Envío gratis en todos los pedidos</p>
          <p>• Entrega en 2-3 días hábiles</p>
          <p>• Seguimiento en tiempo real</p>
        </div>
      </div>

      {/* Botón de checkout */}
      <button
        onClick={onCheckout}
        className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
      >
        <CreditCard className="h-5 w-5" />
        <span>
          {isAuthenticated ? 'Proceder al Pago' : 'Iniciar Sesión para Comprar'}
        </span>
      </button>

      {!isAuthenticated && (
        <p className="text-xs text-gray-500 text-center mt-3">
          Necesitas una cuenta para realizar compras
        </p>
      )}

      {/* Enlaces adicionales */}
      <div className="mt-6 space-y-2 text-center">
        <Link
          to="/products"
          className="block text-indigo-600 hover:text-indigo-800 transition-colors text-sm"
        >
          ← Seguir comprando
        </Link>
        
        <div className="text-xs text-gray-500">
          <p>Pagos seguros con Stripe</p>
          <p>Garantía de satisfacción 100%</p>
        </div>
      </div>
    </div>
  );
};

export default Cart;