import api from '../config/api';

// Servicios de autenticación
export const authService = {
  // Login
  login: async (credentials) => {
    const response = await api.post('token/', credentials);
    return response.data;
  },

  // Registro
  register: async (userData) => {
    const response = await api.post('users/', userData);
    return response.data;
  },

  // Obtener información del usuario actual
  getCurrentUser: async () => {
    const response = await api.get('users/profile/');
    return response.data;
  },

  // Refrescar token
  refreshToken: async (refreshToken) => {
    const response = await api.post('token/refresh/', { refresh: refreshToken });
    return response.data;
  },

  // Logout (limpiar tokens del localStorage)
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};

// Servicios de usuarios
export const userService = {
  // Obtener perfil del usuario actual
  getProfile: async () => {
    const response = await api.get('users/profile/');
    return response.data;
  },

  // Actualizar perfil del usuario
  updateProfile: async (userId, userData) => {
    const response = await api.patch(`users/${userId}/`, userData);
    return response.data;
  },

  // Listar todos los usuarios (admin)
  listUsers: async () => {
    const response = await api.get('users/');
    return response.data;
  },

  // Obtener un usuario específico (admin)
  getUser: async (userId) => {
    const response = await api.get(`users/${userId}/`);
    return response.data;
  },

  // Crear usuario (admin)
  createUser: async (userData) => {
    const response = await api.post('users/', userData);
    return response.data;
  },

  // Actualizar usuario (admin)
  updateUser: async (userId, userData) => {
    const response = await api.patch(`users/${userId}/`, userData);
    return response.data;
  },

  // Eliminar usuario (admin)
  deleteUser: async (userId) => {
    const response = await api.delete(`users/${userId}/`);
    return response.data;
  },
};

// Servicios de productos
export const productService = {
  // Obtener todos los productos
  getProducts: async () => {
    const response = await api.get('products/');
    return response.data;
  },

  // Obtener un producto específico
  getProduct: async (id) => {
    const response = await api.get(`products/${id}/`);
    return response.data;
  },

  // Crear producto (admin)
  createProduct: async (productData) => {
    const response = await api.post('products/', productData);
    return response.data;
  },

  // Actualizar producto (admin)
  updateProduct: async (id, productData) => {
    const response = await api.put(`products/${id}/`, productData);
    return response.data;
  },

  // Eliminar producto (admin)
  deleteProduct: async (id) => {
    const response = await api.delete(`products/${id}/`);
    return response.data;
  },
};

// Servicios de categorías
export const categoryService = {
  // Obtener todas las categorías
  getCategories: async () => {
    const response = await api.get('categories/');
    return response.data;
  },

  // Obtener una categoría específica
  getCategory: async (id) => {
    const response = await api.get(`categories/${id}/`);
    return response.data;
  },

  // Crear categoría (admin)
  createCategory: async (categoryData) => {
    const response = await api.post('categories/', categoryData);
    return response.data;
  },

  // Actualizar categoría (admin)
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`categories/${id}/`, categoryData);
    return response.data;
  },

  // Eliminar categoría (admin)
  deleteCategory: async (id) => {
    const response = await api.delete(`categories/${id}/`);
    return response.data;
  },
};

// Servicios de órdenes
export const orderService = {
  // Obtener órdenes del usuario
  getOrders: async () => {
    const response = await api.get('orders/');
    return response.data;
  },

  // Obtener una orden específica
  getOrder: async (id) => {
    const response = await api.get(`orders/${id}/`);
    return response.data;
  },

  // Crear orden
  createOrder: async (orderData) => {
    const response = await api.post('orders/create/', orderData);
    return response.data;
  },

  // Crear sesión de checkout de Stripe
  createCheckoutSession: async (orderId, urls) => {
    const response = await api.post(`orders/${orderId}/create-checkout-session/`, urls);
    return response.data;
  },
};

// Servicios de reportes (admin)
export const reportService = {
  // Generar reporte de ventas
  generateSalesReport: async (startDate, endDate, format = 'pdf') => {
    const response = await api.get(
      `reports/sales/?start_date=${startDate}&end_date=${endDate}${format === 'excel' ? '&report_format=excel' : ''}`,
      { responseType: 'blob' }
    );
    return response.data;
  },
};