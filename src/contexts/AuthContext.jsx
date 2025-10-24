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
      dispatch({ type: authActions.SET_LOADING, payload: true });
      
      // 1. Obtener tokens
      const response = await authService.login(credentials);
      const { access, refresh } = response;

      // Guardar tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // 2. Obtener información del usuario (incluyendo is_staff)
      const userData = await authService.getCurrentUser();
      
      // 🔍 DEBUG: Verificar qué datos se están recibiendo
      console.log('🔍 DEBUG - Datos del usuario recibidos:', userData);
      console.log('🔍 DEBUG - is_staff:', userData.is_staff);
      console.log('🔍 DEBUG - is_superuser:', userData.is_superuser);
      
      // Guardar usuario completo en localStorage
      localStorage.setItem('user', JSON.stringify(userData));

      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: {
          user: userData,
        },
      });

      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Error en login:', error);
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

  // Verificar si el usuario es admin
  const isAdmin = () => {
    return state.user?.is_staff === true;
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};