import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  XCircle, 
  ArrowLeft, 
  RefreshCw, 
  HelpCircle,
  ShoppingCart,
  Home,
  CreditCard
} from 'lucide-react';

const PaymentCancelled = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pago Cancelado
          </h1>
          
          <p className="text-lg text-gray-600 mb-4">
            Tu pago ha sido cancelado y no se ha procesado ningún cargo
          </p>
          
          {orderId && (
            <div className="inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-sm font-medium text-yellow-800">
                Orden #{orderId} - No procesada
              </span>
            </div>
          )}
        </div>

        {/* Información */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ¿Qué pasó?
          </h2>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
              <p>El proceso de pago fue interrumpido o cancelado antes de completarse</p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
              <p>No se ha realizado ningún cargo a tu tarjeta o método de pago</p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
              <p>Tu orden queda pendiente y podrás completar el pago más tarde</p>
            </div>
          </div>
        </div>

        {/* Opciones */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            ¿Qué puedes hacer ahora?
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Intentar el pago nuevamente</p>
                <p className="text-sm text-blue-700">Vuelve a tu carrito y procede al checkout</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Revisar tu método de pago</p>
                <p className="text-sm text-blue-700">Verifica que tu tarjeta esté activa y tenga fondos suficientes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Contactar soporte</p>
                <p className="text-sm text-blue-700">Si continúas teniendo problemas, nuestro equipo te ayudará</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posibles causas */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Posibles causas del problema
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Problemas con la tarjeta:</h4>
              <ul className="space-y-1">
                <li>• Fondos insuficientes</li>
                <li>• Tarjeta vencida</li>
                <li>• Límite de crédito excedido</li>
                <li>• Tarjeta bloqueada</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Otros motivos:</h4>
              <ul className="space-y-1">
                <li>• Cancelación manual del usuario</li>
                <li>• Problemas de conexión</li>
                <li>• Sesión expirada</li>
                <li>• Error en los datos ingresados</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/cart"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Intentar de Nuevo</span>
          </Link>
          
          <Link
            to="/products"
            className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="h-5 w-5" />
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

        {/* Información de soporte */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
          <div className="flex items-start space-x-3">
            <HelpCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">¿Necesitas ayuda?</h3>
              <p className="text-sm text-yellow-800 mb-3">
                Si continúas teniendo problemas con el pago, nuestro equipo de soporte está aquí para ayudarte.
              </p>
              <div className="space-y-1 text-sm text-yellow-800">
                <p><strong>Email:</strong> soporte@smartsales365.com</p>
                <p><strong>Teléfono:</strong> +591 123-456-789</p>
                <p><strong>Horario:</strong> Lunes a Viernes, 8:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nota de seguridad */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            🔒 Todos los pagos son procesados de forma segura. Tu información financiera está protegida.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;