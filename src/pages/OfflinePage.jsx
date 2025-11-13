import React from 'react';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OfflinePage = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icono animado */}
          <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <WifiOff className="w-12 h-12 text-orange-600" />
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Sin conexión
          </h1>

          {/* Descripción */}
          <p className="text-gray-600 mb-6">
            No hay conexión a Internet. Puedes seguir navegando por el contenido almacenado en caché.
          </p>

          {/* Características offline */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              ✅ Disponible sin conexión:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Productos visitados recientemente</li>
              <li>• Páginas navegadas anteriormente</li>
              <li>• Imágenes en caché</li>
              <li>• Carrito de compras local</li>
            </ul>
          </div>

          {/* Acciones */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Reintentar conexión
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Ir al inicio
            </button>
          </div>

          {/* Consejo */}
          <p className="text-xs text-gray-500 mt-6">
            💡 Tip: La app funciona mejor con conexión, pero puedes navegar contenido cacheado mientras estás offline.
          </p>
        </div>

        {/* Estado de red */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Modo offline</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;
