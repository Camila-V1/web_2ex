import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/api';
import { 
  CreditCard, 
  Truck, 
  Shield, 
  ArrowLeft, 
  Package,
  MapPin,
  Phone,
  Mail,
  User,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const Checkout = () => {
  const { items, totalItems, totalAmount, clearCart, getCartForAPI } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Review, 2: Payment
  
  // Información de envío (en una app real esto vendría de un formulario)
  const [shippingInfo] = useState({
    firstName: user?.first_name || 'Juan',
    lastName: user?.last_name || 'Pérez',
    email: user?.email || 'juan@email.com',
    phone: '+591 123-456-789',
    address: 'Av. Cristo Redentor #123',
    city: 'Santa Cruz',
    country: 'Bolivia',
    zipCode: '00000'
  });

  // Cálculos
  const shipping = 0; // Envío gratis
  const tax = totalAmount * 0.13; // IVA 13%
  const finalTotal = totalAmount + shipping + tax;

  const handleCreateOrder = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // 1. Crear la orden en el backend
      const cartData = getCartForAPI();
      console.log('Datos del carrito para API:', cartData);
      
      const order = await orderService.createOrder(cartData);
      console.log('Orden creada:', order);

      // 2. Crear sesión de checkout de Stripe
      const checkoutSession = await orderService.createCheckoutSession(order.id, {
        success_url: `${window.location.origin}/payment-success?order_id=${order.id}`,
        cancel_url: `${window.location.origin}/payment-cancelled?order_id=${order.id}`
      });

      console.log('Sesión de checkout creada:', checkoutSession);

      // 3. Limpiar carrito (la orden ya fue creada)
      clearCart();

      // 4. Redirigir a Stripe Checkout
      if (checkoutSession.checkout_url) {
        window.location.href = checkoutSession.checkout_url;
      } else {
        throw new Error('No se pudo obtener la URL de pago');
      }

    } catch (err) {
      console.error('Error en checkout:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.detail || 
        'Error al procesar el pago. Por favor, intenta nuevamente.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-600 mb-8">Agrega algunos productos antes de proceder al checkout.</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Ir a productos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver al carrito</span>
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
        <p className="text-gray-600 mt-1">
          Revisa tu pedido y procede al pago seguro
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna izquierda - Información del pedido */}
        <div className="space-y-6">
          {/* Información de envío */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Truck className="h-5 w-5 mr-2 text-indigo-600" />
              Información de Envío
            </h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span>{shippingInfo.firstName} {shippingInfo.lastName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{shippingInfo.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{shippingInfo.phone}</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p>{shippingInfo.address}</p>
                  <p>{shippingInfo.city}, {shippingInfo.country} {shippingInfo.zipCode}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-800">Envío gratis incluido</span>
              </div>
            </div>
          </div>

          {/* Métodos de pago */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-indigo-600" />
              Método de Pago
            </h2>
            
            <div className="space-y-4">
              <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="font-medium text-indigo-900">Pago Seguro con Stripe</p>
                    <p className="text-sm text-indigo-700">
                      Tarjetas de crédito, débito y métodos locales
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>✓ Transacciones protegidas con SSL</p>
                <p>✓ No almacenamos información de tarjetas</p>
                <p>✓ Procesamiento seguro internacional</p>
              </div>
            </div>
          </div>

          {/* Políticas */}
          <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-2">
            <p><strong>Política de devoluciones:</strong> 30 días para devoluciones</p>
            <p><strong>Garantía:</strong> Todos los productos incluyen garantía del fabricante</p>
            <p><strong>Soporte:</strong> Atención al cliente 24/7</p>
          </div>
        </div>

        {/* Columna derecha - Resumen del pedido */}
        <div className="space-y-6">
          {/* Productos en el carrito */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tu Pedido ({totalItems} productos)
            </h2>
            
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  
                  <p className="text-sm font-semibold text-gray-900">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen de costos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Pago</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({totalItems} productos)</span>
                <span className="font-medium">${totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span className="font-medium text-green-600">Gratis</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA (13%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de pago */}
            <button
              onClick={handleCreateOrder}
              disabled={isProcessing}
              className="w-full mt-6 bg-indigo-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Pagar ${finalTotal.toFixed(2)}</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Al hacer clic en "Pagar" serás redirigido a Stripe para completar el pago de forma segura
            </p>
          </div>

          {/* Badges de seguridad */}
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span>SSL Seguro</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4" />
              <span>Garantizado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;