import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';

// Estado inicial
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Acciones
const authActions = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case authActions.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case authActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case authActions.LOGIN_ERROR:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case authActions.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case authActions.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Context
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar si hay token al cargar la aplicación
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      
      if (token) {
        try {
          // Si hay un usuario guardado, usarlo
          if (storedUser) {
            dispatch({
              type: authActions.LOGIN_SUCCESS,
              payload: {
                user: JSON.parse(storedUser),
              },
            });
          } else {
            // Si no hay usuario guardado pero sí token, obtenerlo del backend
            const userData = await authService.getCurrentUser();
            localStorage.setItem('user', JSON.stringify(userData));
            dispatch({
              type: authActions.LOGIN_SUCCESS,
              payload: {
                user: userData,
              },
            });
          }
        } catch (error) {
          console.error('Error al obtener usuario:', error);
          // Si falla, limpiar el token inválido
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          dispatch({ type: authActions.SET_LOADING, payload: false });
        }
      } else {
        dispatch({ type: authActions.SET_LOADING, payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  // Función de login
  const login = async (credentials) => {
    try {
      console.log('🔷 [AUTHCONTEXT 1] Iniciando login...');
      console.log('🔷 [AUTHCONTEXT 2] Credenciales:', {
        username: credentials.username,
        hasPassword: !!credentials.password,
      });

      dispatch({ type: authActions.SET_LOADING, payload: true });
      
      // 1. Obtener tokens
      console.log('🔷 [AUTHCONTEXT 3] Llamando a authService.login...');
      const response = await authService.login(credentials);
      const { access, refresh } = response;

      console.log('🔷 [AUTHCONTEXT 4] Tokens recibidos:', {
        hasAccess: !!access,
        hasRefresh: !!refresh,
        accessLength: access?.length,
      });

      // Guardar tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      console.log('🔷 [AUTHCONTEXT 5] Tokens guardados en localStorage');

      // 2. Obtener información del usuario (incluyendo is_staff)
      console.log('🔷 [AUTHCONTEXT 6] Obteniendo información del usuario...');
      const userData = await authService.getCurrentUser();
      
      // 🔍 DEBUG: Verificar qué datos se están recibiendo
      console.log('🔍 [AUTHCONTEXT 7] DEBUG - Datos del usuario recibidos:', userData);
      console.log('🔍 [AUTHCONTEXT 8] DEBUG - is_staff:', userData.is_staff);
      console.log('🔍 [AUTHCONTEXT 9] DEBUG - is_superuser:', userData.is_superuser);
      console.log('🔍 [AUTHCONTEXT 10] DEBUG - role:', userData.role);
      
      // Guardar usuario completo en localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('🔷 [AUTHCONTEXT 11] Usuario guardado en localStorage');

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: {
          user: userData,
        },
      });

      console.log('✅ [AUTHCONTEXT 12] Login completado exitosamente');
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ [AUTHCONTEXT ERROR] Error en login:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        detail: error.response?.data?.detail,
        fullError: error.response?.data,
      });
      const errorMessage = error.response?.data?.detail || 'Error en el inicio de sesión';
      dispatch({
        type: authActions.LOGIN_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Función de registro
  const register = async (userData) => {
    try {
      dispatch({ type: authActions.SET_LOADING, payload: true });
      
      await authService.register(userData);
      
      // Después del registro exitoso, hacer login automáticamente
      const loginResult = await login({
        username: userData.username,
        password: userData.password,
      });

      return loginResult;
    } catch (error) {
      const errorMessage = error.response?.data?.username?.[0] || 
                          error.response?.data?.email?.[0] || 
                          'Error en el registro';
      dispatch({
        type: authActions.LOGIN_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Función de logout
  const logout = () => {
    authService.logout();
    dispatch({ type: authActions.LOGOUT });
  };

  // Limpiar errores
  const clearError = () => {
    dispatch({ type: authActions.CLEAR_ERROR });
  };

  // Verificar si el usuario es SOLO ADMIN (control total del sistema)
  const isAdmin = () => {
    const role = state.user?.role;
    const isStaff = state.user?.is_staff;
    // Solo ADMIN tiene acceso completo (usuarios, productos, categorías, etc.)
    const result = role === 'ADMIN' && isStaff === true;
    console.log('🔍 [AUTH] isAdmin() - role:', role, '| is_staff:', isStaff, '| result:', result);
    return result;
  };

  // Verificar si el usuario es Manager (dashboard, reportes, predicciones, clientes)
  const isManager = () => {
    const role = state.user?.role;
    const result = role === 'MANAGER' || role === 'ADMIN'; // ADMIN también puede acceder a funciones de Manager
    console.log('🔍 [AUTH] isManager() - role:', role, '| result:', result);
    return result;
  };

  // Verificar si el usuario es Cajero (crear órdenes, ver historial ventas)
  const isCajero = () => {
    const role = state.user?.role;
    const result = role === 'CAJERO' || role === 'MANAGER' || role === 'ADMIN';
    console.log('🔍 [AUTH] isCajero() - role:', role, '| result:', result);
    return result;
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Verificar si el usuario tiene permisos según jerarquía de roles
  const hasPermission = (requiredRole) => {
    const roleHierarchy = { 
      ADMIN: 3, 
      MANAGER: 2, 
      CAJERO: 1 
    };
    const userRoleLevel = roleHierarchy[state.user?.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    return userRoleLevel >= requiredLevel;
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    isAdmin,      // Solo ADMIN (control total)
    isManager,    // MANAGER + ADMIN
    isCajero,     // CAJERO + MANAGER + ADMIN
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};