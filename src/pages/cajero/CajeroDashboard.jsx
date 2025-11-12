import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function CajeroDashboard() {
  const { user } = useAuth();

  useEffect(() => {
    console.log('✅ [CAJERO DASHBOARD] Componente montado');
    console.log('🔍 [CAJERO DASHBOARD] Usuario:', user);
    console.log('🔍 [CAJERO DASHBOARD] Role:', user?.role);
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard - Cajero
          </h1>
          <p className="mt-2 text-gray-600">
            Bienvenido, {user?.username} (Rol: {user?.role})
          </p>
        </div>

        {/* Debug Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            🔍 Debug Info
          </h2>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Usuario:</strong> {user?.username}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>is_staff:</strong> {user?.is_staff ? 'true' : 'false'}</p>
            <p><strong>Ruta actual:</strong> {window.location.pathname}</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Dashboard del Cajero (En Desarrollo)
          </h2>
          <p className="text-gray-600">
            Este es el dashboard principal para cajeros.
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800">
              ⚠️ Página en construcción. Funcionalidades próximamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
