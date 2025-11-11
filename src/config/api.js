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
    console.log('🔷 [AXIOS REQUEST]', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: config.baseURL + config.url,
      data: config.data,
      headers: {
        'Content-Type': config.headers['Content-Type'],
        'Authorization': config.headers.Authorization ? 'Bearer ***' : 'No token',
      },
    });

    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔷 [AXIOS REQUEST] Token agregado');
    } else {
      console.log('🔷 [AXIOS REQUEST] No hay token');
    }
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
    console.log('✅ [AXIOS RESPONSE]', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      dataKeys: Object.keys(response.data || {}),
    });
    return response;
  },
  async (error) => {
    console.error('❌ [AXIOS RESPONSE ERROR]', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
      message: error.message,
    });

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