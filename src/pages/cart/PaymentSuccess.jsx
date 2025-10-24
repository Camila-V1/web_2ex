import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { orderService } from '../../services/api';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Calendar,
  CreditCard,
  Home,
  FileText,
  Loader2
} from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stripe envía session_id, pero también podemos recibir order_id directamente
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (orderId) {
      loadOrder();
    } else if (sessionId) {
      // Si solo tenemos session_id, mostrar mensaje genérico de éxito
      // El webhook ya actualizó la orden en el backend
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [orderId, sessionId]);

  const loadOrder = async () => {
    try {
      const orderData = await orderService.getOrder(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
      setError('No se pudo cargar la información de la orden');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de éxito */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Pago Exitoso!
          </h1>
          
          <p className="text-lg text-gray-600 mb-4">
            Tu pedido ha sido procesado correctamente
          </p>
          
          {order && (
            <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-sm font-medium text-green-800">
                Orden #{order.id} - ${parseFloat(order.total_amount).toFixed(2)}
              </span>
            </div>
          )}
          
          {!order && sessionId && (
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium text-blue-800">
                Pago confirmado por Stripe
              </span>
            </div>
          )}
        </div>

        {/* Mensaje cuando solo tenemos session_id */}
        {!order && sessionId && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Tu pago se ha procesado correctamente
              </h2>
              <p className="text-gray-600">
                Recibirás un email de confirmación con todos los detalles de tu pedido.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <p className="text-sm text-gray-500">
                  ID de sesión de Stripe:
                </p>
                <p className="text-xs text-gray-400 font-mono break-all">
                  {sessionId}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mostrar error si lo hay */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800 text-center">{error}</p>
          </div>
        )}

        {/* Detalles del pedido */}
        {order && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2 text-indigo-600" />
                Detalles de tu Pedido
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Información del Pedido</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Número de orden: #{order.id}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Fecha: {formatDate(order.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Estado: {order.status === 'paid' ? 'Pagado' : order.status}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Estado del Envío</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4" />
                      <span>Preparando para envío</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>• Tiempo estimado: 2-3 días hábiles</p>
                      <p>• Recibirás un email con el tracking</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de productos */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Productos Comprados</h3>
                <div className="space-y-3">
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Producto ID: {item.product}
                          </p>
                          <p className="text-sm text-gray-500">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${parseFloat(item.price).toFixed(2)} c/u
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Pagado</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${parseFloat(order.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Próximos pasos */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">¿Qué sigue ahora?</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
              <div>
                <p className="font-medium">Confirmación por email</p>
                <p>Te enviaremos un email con todos los detalles de tu compra</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
              <div>
                <p className="font-medium">Preparación del pedido</p>
                <p>Nuestro equipo preparará tu pedido para el envío</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
              <div>
                <p className="font-medium">Envío y tracking</p>
                <p>Recibirás el código de seguimiento para rastrear tu pedido</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center flex items-center justify-center space-x-2"
          >
            <FileText className="h-5 w-5" />
            <span>Ver Mis Pedidos</span>
          </Link>
          
          <Link
            to="/products"
            className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center flex items-center justify-center space-x-2"
          >
            <Package className="h-5 w-5" />
            <span>Seguir Comprando</span>
          </Link>
          
          <Link
            to="/"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center flex items-center justify-center space-x-2"
          >
            <Home className="h-5 w-5" />
            <span>Ir al Inicio</span>
          </Link>
        </div>

        {/* Soporte */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            ¿Necesitas ayuda con tu pedido?
          </p>
          <p className="text-sm">
            Contacta nuestro soporte: <a href="mailto:soporte@smartsales365.com" className="text-indigo-600 hover:text-indigo-800">soporte@smartsales365.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;