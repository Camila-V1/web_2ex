import React, { useState, useEffect } from 'react';
import { Download, Check } from 'lucide-react';

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('✅ PWA instalable detectada');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar si se instaló
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA instalada exitosamente');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.warn('⚠️ No hay prompt de instalación disponible');
      return;
    }

    // Mostrar el prompt de instalación
    deferredPrompt.prompt();

    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Usuario eligió: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('✅ Usuario aceptó instalar la PWA');
      setIsInstalled(true);
    } else {
      console.log('❌ Usuario rechazó instalar la PWA');
    }

    // Limpiar el prompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // No mostrar nada si ya está instalada
  if (isInstalled) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
        <Check className="h-4 w-4" />
        <span className="hidden sm:inline">Instalada</span>
      </div>
    );
  }

  // No mostrar nada si no es instalable
  if (!isInstallable) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
      title="Instalar SmartSales365 como aplicación"
    >
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">Instalar App</span>
    </button>
  );
};

export default PWAInstallButton;
