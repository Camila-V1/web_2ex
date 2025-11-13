import { useState, useEffect } from 'react';

/**
 * Hook para detectar el estado de conexión de red
 * @returns {boolean} true si hay conexión, false si está offline
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ Conexión restablecida');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('❌ Sin conexión');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

/**
 * Hook para hacer fetch con fallback a caché offline
 * @param {string} url - URL a consultar
 * @param {object} options - Opciones de fetch
 * @returns {object} { data, loading, error, refetch }
 */
export const useOfflineFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isOnline = useOnlineStatus();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);

      // Guardar en localStorage como caché
      try {
        localStorage.setItem(`cache_${url}`, JSON.stringify({
          data: result,
          timestamp: Date.now(),
        }));
      } catch (e) {
        console.warn('No se pudo guardar en caché:', e);
      }

    } catch (err) {
      console.error('Error en fetch:', err);
      
      // Si estamos offline, intentar cargar desde caché
      if (!isOnline) {
        try {
          const cached = localStorage.getItem(`cache_${url}`);
          if (cached) {
            const { data: cachedData, timestamp } = JSON.parse(cached);
            const ageInHours = (Date.now() - timestamp) / (1000 * 60 * 60);
            
            console.log(`📦 Cargando desde caché (${ageInHours.toFixed(1)}h de antigüedad)`);
            setData(cachedData);
            setError({
              message: 'Mostrando datos en caché (sin conexión)',
              isOffline: true,
            });
          } else {
            setError({
              message: 'Sin conexión y sin datos en caché',
              isOffline: true,
            });
          }
        } catch (cacheError) {
          console.error('Error al leer caché:', cacheError);
          setError({
            message: 'Error al cargar datos offline',
            isOffline: true,
          });
        }
      } else {
        setError({
          message: err.message,
          isOffline: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url, isOnline]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    isOnline,
  };
};

/**
 * Guardar datos en caché para uso offline
 * @param {string} key - Clave única para el dato
 * @param {any} data - Datos a guardar
 */
export const saveToOfflineCache = (key, data) => {
  try {
    localStorage.setItem(`offline_${key}`, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
    console.log(`✅ Guardado en caché offline: ${key}`);
  } catch (error) {
    console.error('Error al guardar en caché:', error);
  }
};

/**
 * Recuperar datos de caché offline
 * @param {string} key - Clave del dato
 * @param {number} maxAgeHours - Edad máxima en horas (default: 24)
 * @returns {any|null} Datos o null si no existe/expiró
 */
export const getFromOfflineCache = (key, maxAgeHours = 24) => {
  try {
    const cached = localStorage.getItem(`offline_${key}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const ageInHours = (Date.now() - timestamp) / (1000 * 60 * 60);

    if (ageInHours > maxAgeHours) {
      console.log(`⏰ Caché expirado: ${key} (${ageInHours.toFixed(1)}h)`);
      localStorage.removeItem(`offline_${key}`);
      return null;
    }

    console.log(`📦 Recuperado de caché: ${key} (${ageInHours.toFixed(1)}h)`);
    return data;
  } catch (error) {
    console.error('Error al leer caché:', error);
    return null;
  }
};

/**
 * Limpiar caché antigua
 * @param {number} maxAgeHours - Edad máxima en horas
 */
export const cleanOldCache = (maxAgeHours = 168) => { // 7 días por defecto
  try {
    const keys = Object.keys(localStorage);
    let cleaned = 0;

    keys.forEach(key => {
      if (key.startsWith('offline_') || key.startsWith('cache_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          const ageInHours = (Date.now() - item.timestamp) / (1000 * 60 * 60);

          if (ageInHours > maxAgeHours) {
            localStorage.removeItem(key);
            cleaned++;
          }
        } catch (e) {
          // Si hay error al parsear, eliminar
          localStorage.removeItem(key);
          cleaned++;
        }
      }
    });

    if (cleaned > 0) {
      console.log(`🧹 Limpiados ${cleaned} items de caché antigua`);
    }
  } catch (error) {
    console.error('Error al limpiar caché:', error);
  }
};
