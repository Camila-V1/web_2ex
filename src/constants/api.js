/**
 * API Constants - Centralized API endpoint definitions
 * 
 * ⚠️ IMPORTANTE: Estas URLs reflejan la nueva estructura del backend
 * después de la corrección de URLs duplicadas.
 * 
 * Estructura de URLs del backend:
 * - /api/users/       → App users (auth, perfil, gestión de usuarios)
 * - /api/products/    → App products (productos, categorías)
 * - /api/orders/      → App shop_orders (órdenes, checkout, admin)
 * - /api/reports/     → App reports (reportes PDF/Excel)
 */

// API Configuration
// Usar proxy de Vercel (ruta relativa) - Vercel redirigirá a http://98.92.49.243/api
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const API_ENDPOINTS = {
  // ===== AUTHENTICATION =====
  TOKEN: '/token/',
  TOKEN_REFRESH: '/token/refresh/',
  
  // ===== USERS =====
  USERS: '/users/',
  USER_REGISTER: '/users/',
  USER_PROFILE: '/users/profile/',
  USER_DETAIL: (id) => `/users/${id}/`,
  
  // ===== PRODUCTS =====
  PRODUCTS: '/products/',
  PRODUCT_DETAIL: (id) => `/products/${id}/`,
  CATEGORIES: '/products/categories/',
  CATEGORY_DETAIL: (id) => `/products/categories/${id}/`,
  
  // ===== ORDERS =====
  ORDERS: '/orders/',
  ORDER_DETAIL: (id) => `/orders/${id}/`,
  ORDER_CREATE: '/orders/create/',
  CHECKOUT_SESSION: (id) => `/orders/${id}/create-checkout-session/`,
  STRIPE_WEBHOOK: '/orders/stripe-webhook/',
  
  // ===== ADMIN - Orders & Dashboard =====
  ADMIN_DASHBOARD: '/orders/admin/dashboard/',
  ADMIN_USERS: '/orders/admin/users/',
  ADMIN_SALES_ANALYTICS: '/orders/admin/analytics/sales/',
  ADMIN_ORDERS: '/orders/admin/',
  ADMIN_ORDER_DETAIL: (id) => `/orders/admin/${id}/`,
  ADMIN_ORDER_UPDATE_STATUS: (id) => `/orders/admin/${id}/update_status/`,
  
  // ===== REPORTS =====
  REPORTS_SALES: '/reports/sales/',
  REPORTS_PRODUCTS: '/reports/products/',
  REPORTS_DYNAMIC_AI: '/reports/dynamic-parser/', // 🤖 Generación con IA/Lenguaje Natural
};

/**
 * Helper para construir URLs completas
 * @param {string} endpoint - El endpoint desde API_ENDPOINTS
 * @returns {string} URL completa
 */
export const getFullUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Helper para obtener headers de autenticación
 * @returns {object} Headers con token Bearer
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Helper para obtener headers de autenticación para descargas de archivos
 * @returns {object} Headers con token Bearer (sin Content-Type)
 */
export const getAuthHeadersForDownload = () => {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// ===== EJEMPLOS DE USO =====
/*

// Ejemplo 1: Fetch simple
import { getFullUrl, API_ENDPOINTS, getAuthHeaders } from './constants/api';

const response = await axios.get(
  getFullUrl(API_ENDPOINTS.USERS),
  { headers: getAuthHeaders() }
);

// Ejemplo 2: Endpoint con parámetro
const userId = 5;
const response = await axios.get(
  getFullUrl(API_ENDPOINTS.USER_DETAIL(userId)),
  { headers: getAuthHeaders() }
);

// Ejemplo 3: POST con body
const response = await axios.post(
  getFullUrl(API_ENDPOINTS.USER_REGISTER),
  { username: 'test', email: 'test@test.com' },
  { headers: getAuthHeaders() }
);

// Ejemplo 4: Descarga de archivo (reporte)
const response = await axios.get(
  getFullUrl(API_ENDPOINTS.REPORTS_SALES),
  { 
    headers: getAuthHeadersForDownload(),
    params: { format: 'pdf', start_date: '2024-01-01', end_date: '2024-12-31' },
    responseType: 'blob'
  }
);

*/
