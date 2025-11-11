import api from '../config/api';

// Servicios de autenticación
export const authService = {
  // Login
  login: async (credentials) => {
    // 🔍 DEBUG: Ver exactamente qué se está enviando
    console.log('🔷 [1] LOGIN REQUEST - Credenciales recibidas:', {
      username: credentials.username,
      password: credentials.password ? '***' : undefined,
      usernameLength: credentials.username?.length,
      passwordLength: credentials.password?.length,
      usernameHasSpaces: credentials.username?.includes(' '),
      passwordHasSpaces: credentials.password?.includes(' '),
    });

    // Limpiar espacios en blanco
    const cleanedCredentials = {
      username: credentials.username?.trim(),
      password: credentials.password?.trim(),
    };

    console.log('🔷 [2] LOGIN REQUEST - Credenciales limpias:', {
      username: cleanedCredentials.username,
      usernameLength: cleanedCredentials.username?.length,
      passwordLength: cleanedCredentials.password?.length,
    });

    try {
      const response = await api.post('token/', cleanedCredentials);
      console.log('✅ [3] LOGIN SUCCESS - Respuesta recibida:', {
        hasAccess: !!response.data.access,
        hasRefresh: !!response.data.refresh,
      });
      return response.data;
    } catch (error) {
      console.error('❌ [4] LOGIN ERROR:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        detail: error.response?.data?.detail,
        fullError: error.response?.data,
      });
      throw error;
    }
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

  // Verificar si un token es válido
  verifyToken: async (token) => {
    const response = await api.post('token/verify/', { token });
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

  // Actualizar usuario completo (admin) - PUT
  updateUserFull: async (userId, userData) => {
    const response = await api.put(`users/${userId}/`, userData);
    return response.data;
  },

  // Actualizar usuario parcial (admin) - PATCH
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

  // Actualizar producto completo (admin) - PUT
  updateProduct: async (id, productData) => {
    const response = await api.put(`products/${id}/`, productData);
    return response.data;
  },

  // Actualizar producto parcial (admin) - PATCH
  patchProduct: async (id, productData) => {
    const response = await api.patch(`products/${id}/`, productData);
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
    const response = await api.get('products/categories/');
    return response.data;
  },

  // Obtener una categoría específica
  getCategory: async (id) => {
    const response = await api.get(`products/categories/${id}/`);
    return response.data;
  },

  // Crear categoría (admin)
  createCategory: async (categoryData) => {
    const response = await api.post('products/categories/', categoryData);
    return response.data;
  },

  // Actualizar categoría completa (admin) - PUT
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`products/categories/${id}/`, categoryData);
    return response.data;
  },

  // Actualizar categoría parcial (admin) - PATCH
  patchCategory: async (id, categoryData) => {
    const response = await api.patch(`products/categories/${id}/`, categoryData);
    return response.data;
  },

  // Eliminar categoría (admin)
  deleteCategory: async (id) => {
    const response = await api.delete(`products/categories/${id}/`);
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
      `reports/sales/?start_date=${startDate}&end_date=${endDate}&format=${format}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Generar reporte de productos/inventario
  generateProductsReport: async (format = 'pdf') => {
    const response = await api.get(
      `reports/products/?format=${format}`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Obtener factura de orden individual
  getInvoice: async (orderId) => {
    const response = await api.get(
      `reports/orders/${orderId}/invoice/`,
      { responseType: 'blob' }
    );
    return response.data;
  },
};

// Servicios de reseñas
export const reviewService = {
  // Listar todas las reseñas (público)
  getAllReviews: async () => {
    const response = await api.get('products/reviews/');
    return response.data;
  },

  // Obtener una reseña específica
  getReview: async (reviewId) => {
    const response = await api.get(`products/reviews/${reviewId}/`);
    return response.data;
  },

  // Obtener reseñas de un producto
  getProductReviews: async (productId) => {
    const response = await api.get(`products/${productId}/reviews/`);
    return response.data;
  },

  // Crear reseña
  createReview: async (reviewData) => {
    const response = await api.post('products/reviews/', reviewData);
    return response.data;
  },

  // Actualizar reseña completa (PUT)
  updateReviewFull: async (reviewId, reviewData) => {
    const response = await api.put(`products/reviews/${reviewId}/`, reviewData);
    return response.data;
  },

  // Actualizar reseña parcial (PATCH)
  updateReview: async (reviewId, reviewData) => {
    const response = await api.patch(`products/reviews/${reviewId}/`, reviewData);
    return response.data;
  },

  // Eliminar reseña
  deleteReview: async (reviewId) => {
    const response = await api.delete(`products/reviews/${reviewId}/`);
    return response.data;
  },
};

// Servicios de recomendaciones (ML)
export const recommendationService = {
  // Obtener productos recomendados
  getRecommendations: async (productId) => {
    const response = await api.get(`products/${productId}/recommendations/`);
    return response.data;
  },
};

// Servicios de NLP (Carrito inteligente)
export const nlpService = {
  // Agregar productos con lenguaje natural
  addToCartNaturalLanguage: async (prompt) => {
    const response = await api.post('orders/cart/add-natural-language/', { prompt });
    return response.data;
  },

  // Obtener sugerencias de productos
  getSuggestions: async (query) => {
    const response = await api.get(`orders/cart/suggestions/?q=${query}`);
    return response.data;
  },
};

// Servicios de predicciones (ML)
export const predictionService = {
  // Obtener predicciones de ventas
  getSalesPredictions: async () => {
    const response = await api.get('predictions/sales/');
    return response.data;
  },
};

// Servicios de administración
export const adminService = {
  // Dashboard
  getDashboard: async () => {
    const response = await api.get('orders/admin/dashboard/');
    return response.data;
  },

  // Analytics de ventas
  getSalesAnalytics: async () => {
    const response = await api.get('orders/admin/analytics/sales/');
    return response.data;
  },

  // Lista de usuarios con estadísticas
  getAdminUsers: async () => {
    const response = await api.get('orders/admin/users/');
    return response.data;
  },

  // Gestión de órdenes admin
  getAllOrders: async () => {
    const response = await api.get('orders/admin/');
    return response.data;
  },

  // Obtener detalle de orden (admin)
  getAdminOrder: async (orderId) => {
    const response = await api.get(`orders/admin/${orderId}/`);
    return response.data;
  },

  // Crear orden como admin (sin carrito)
  createAdminOrder: async (orderData) => {
    const response = await api.post('orders/admin/', orderData);
    return response.data;
  },

  // Actualizar orden completa (admin) - PUT
  updateAdminOrder: async (orderId, orderData) => {
    const response = await api.put(`orders/admin/${orderId}/`, orderData);
    return response.data;
  },

  // Actualizar orden parcial (admin) - PATCH
  patchAdminOrder: async (orderId, orderData) => {
    const response = await api.patch(`orders/admin/${orderId}/`, orderData);
    return response.data;
  },

  // Actualizar estado de orden (endpoint específico)
  updateOrderStatus: async (orderId, status) => {
    const response = await api.post(`orders/admin/${orderId}/update_status/`, { status });
    return response.data;
  },

  deleteOrder: async (orderId) => {
    const response = await api.delete(`orders/admin/${orderId}/`);
    return response.data;
  },
};

// Servicios de devoluciones (Returns)
export const returnService = {
  // Solicitar devolución (cliente)
  requestReturn: async (returnData) => {
    const response = await api.post('deliveries/returns/', returnData);
    return response.data;
  },

  // Obtener mis devoluciones (cliente) o todas (manager/admin)
  getReturns: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `deliveries/returns/?${queryString}` : 'deliveries/returns/';
    const response = await api.get(url);
    return response.data;
  },

  // Obtener detalle de una devolución
  getReturn: async (returnId) => {
    const response = await api.get(`deliveries/returns/${returnId}/`);
    return response.data;
  },

  // Enviar a evaluación (manager/admin)
  sendToEvaluation: async (returnId) => {
    const response = await api.post(`deliveries/returns/${returnId}/send_to_evaluation/`, {});
    return response.data;
  },

  // Aprobar devolución (manager/admin)
  approveReturn: async (returnId, evaluationNotes, refundAmount) => {
    const response = await api.post(`deliveries/returns/${returnId}/approve/`, {
      evaluation_notes: evaluationNotes,
      refund_amount: refundAmount
    });
    return response.data;
  },

  // Rechazar devolución (manager/admin)
  rejectReturn: async (returnId, evaluationNotes) => {
    const response = await api.post(`deliveries/returns/${returnId}/reject/`, {
      evaluation_notes: evaluationNotes
    });
    return response.data;
  },
};

// Servicios de billetera virtual (Wallet)
export const walletService = {
  // Obtener mi saldo
  getMyBalance: async () => {
    const response = await api.get('users/wallets/my_balance/');
    return response.data;
  },

  // Obtener mi billetera (detalle completo)
  getMyWallet: async () => {
    const response = await api.get('users/wallets/');
    return response.data;
  },

  // Obtener mis transacciones
  getMyTransactions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `users/wallet-transactions/my_transactions/?${queryString}` : 'users/wallet-transactions/my_transactions/';
    const response = await api.get(url);
    return response.data;
  },

  // Obtener estadísticas de mi wallet
  getStatistics: async () => {
    const response = await api.get('users/wallet-transactions/statistics/');
    return response.data;
  },
};