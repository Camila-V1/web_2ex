import axios from 'axios';

// Configuración base de la API - Usa proxy de Vercel (ruta relativa)
// Vercel redirigirá /api/* a http://98.92.49.243/api/*
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Asegurar que termine con /
const API_URL = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;

console.log('🔧 [CONFIG] API_BASE_URL:', API_BASE_URL);
console.log('🔧 [CONFIG] API_URL:', API_URL);

// Instancia principal de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación automáticamente
api.interceptors.request.use(
  (config) => {
    // Construir URL completa para debugging
    const fullURL = new URL(config.url || '', config.baseURL || window.location.origin).href;
    
    console.log('🔷 [AXIOS REQUEST] ============================================');
    console.log('🔷 [AXIOS REQUEST] Method:', config.method?.toUpperCase());
    console.log('🔷 [AXIOS REQUEST] baseURL:', config.baseURL);
    console.log('🔷 [AXIOS REQUEST] url:', config.url);
    console.log('🔷 [AXIOS REQUEST] Full URL:', fullURL);
    console.log('🔷 [AXIOS REQUEST] Window Location:', window.location.href);
    console.log('🔷 [AXIOS REQUEST] Data:', config.data);
    console.log('🔷 [AXIOS REQUEST] Headers:', {
      'Content-Type': config.headers['Content-Type'],
      'Authorization': config.headers.Authorization ? 'Bearer ***' : 'No token',
    });

    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔷 [AXIOS REQUEST] ✅ Token agregado');
    } else {
      console.log('🔷 [AXIOS REQUEST] ⚠️ No hay token (normal para login)');
    }
    console.log('🔷 [AXIOS REQUEST] ============================================');
    return config;
  },
  (error) => {
    console.error('❌ [AXIOS REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y refrescar tokens
api.interceptors.response.use(
  (response) => {
    console.log('✅ [AXIOS RESPONSE] ============================================');
    console.log('✅ [AXIOS RESPONSE] Status:', response.status, response.statusText);
    console.log('✅ [AXIOS RESPONSE] URL:', response.config.url);
    console.log('✅ [AXIOS RESPONSE] Full URL:', response.request?.responseURL || 'N/A');
    console.log('✅ [AXIOS RESPONSE] Data Keys:', Object.keys(response.data || {}));
    console.log('✅ [AXIOS RESPONSE] Data:', response.data);
    console.log('✅ [AXIOS RESPONSE] ============================================');
    return response;
  },
  async (error) => {
    console.error('❌ [AXIOS RESPONSE ERROR] ============================================');
    console.error('❌ [AXIOS RESPONSE ERROR] Status:', error.response?.status);
    console.error('❌ [AXIOS RESPONSE ERROR] Status Text:', error.response?.statusText);
    console.error('❌ [AXIOS RESPONSE ERROR] URL:', error.config?.url);
    console.error('❌ [AXIOS RESPONSE ERROR] Method:', error.config?.method?.toUpperCase());
    console.error('❌ [AXIOS RESPONSE ERROR] Base URL:', error.config?.baseURL);
    console.error('❌ [AXIOS RESPONSE ERROR] Full URL:', error.request?.responseURL || 'N/A');
    console.error('❌ [AXIOS RESPONSE ERROR] Response Data:', error.response?.data);
    console.error('❌ [AXIOS RESPONSE ERROR] Error Message:', error.message);
    console.error('❌ [AXIOS RESPONSE ERROR] Error Code:', error.code);
    console.error('❌ [AXIOS RESPONSE ERROR] Request:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      method: error.config?.method,
      data: error.config?.data,
    });
    console.error('❌ [AXIOS RESPONSE ERROR] ============================================');

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔶 [AXIOS] 401 detectado, intentando refrescar token...');
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          console.log('🔶 [AXIOS] Llamando a token/refresh/...');
          const response = await axios.post(`${API_URL}token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);
          console.log('✅ [AXIOS] Token refrescado exitosamente');

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } else {
          console.warn('⚠️ [AXIOS] No hay refresh token disponible');
        }
      } catch (refreshError) {
        console.error('❌ [AXIOS] Error al refrescar token:', refreshError);
        // Si el refresh también falla, limpiar tokens y redirigir al login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        console.log('🔴 [AXIOS] Redirigiendo a /login');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;