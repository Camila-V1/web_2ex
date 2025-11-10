import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ProtectedManagerRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading, hasRole, isAdmin } = useAuth();

  // Mientras está cargando, mostrar loader
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si tiene permisos: ADMIN o MANAGER
  const hasPermission = isAdmin() || (hasRole && (hasRole('MANAGER') || hasRole('CAJERO')));

  // Si no tiene permisos, mostrar mensaje de acceso denegado
  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 mb-6">
            No tienes permisos de Manager/Cajero para acceder a esta página.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Volver
            </button>
            <button
              onClick={() => window.location.href = '/products'}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Ir a Productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si tiene permisos, permitir acceso
  return children;
};

export default ProtectedManagerRoute;
