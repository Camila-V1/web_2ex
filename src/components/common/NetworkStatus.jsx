import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, X } from 'lucide-react';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ Conexión restablecida');
      setIsOnline(true);
      setJustReconnected(true);
      setShowBanner(true);

      // Ocultar banner de reconexión después de 5 segundos
      setTimeout(() => {
        setShowBanner(false);
        setJustReconnected(false);
      }, 5000);
    };

    const handleOffline = () => {
      console.log('❌ Conexión perdida');
      setIsOnline(false);
      setShowBanner(true);
      setJustReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${
        isOnline
          ? 'bg-green-600'
          : 'bg-orange-600'
      } text-white shadow-lg`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="w-5 h-5" />
            ) : (
              <WifiOff className="w-5 h-5 animate-pulse" />
            )}
            
            <div>
              <p className="font-semibold">
                {isOnline 
                  ? '✅ Conexión restablecida' 
                  : '⚠️ Sin conexión a Internet'}
              </p>
              <p className="text-sm opacity-90">
                {isOnline 
                  ? 'Ahora puedes acceder a todo el contenido actualizado' 
                  : 'Modo offline activado. Contenido limitado a datos en caché.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowBanner(false)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;
