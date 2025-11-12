import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('🔷 [LOGIN 1] Formulario enviado');
    console.log('🔷 [LOGIN 2] Datos del formulario:', {
      username: formData.username,
      hasPassword: !!formData.password,
      usernameLength: formData.username.length,
      passwordLength: formData.password.length,
    });

    try {
      console.log('🔷 [LOGIN 3] Llamando a login() del AuthContext...');
      const result = await login(formData);
      
      console.log('🔍 [LOGIN 4] DEBUG - Resultado del login:', result);
      console.log('🔍 [LOGIN 5] DEBUG - result.success:', result.success);
      console.log('🔍 [LOGIN 6] DEBUG - result.user:', result.user);
      console.log('🔍 [LOGIN 7] DEBUG - result.user?.is_staff:', result.user?.is_staff);
      console.log('🔍 [LOGIN 8] DEBUG - result.user?.role:', result.user?.role);
      
      if (result.success) {
        // Redirigir según el ROL específico del usuario
        const userRole = result.user?.role;
        
        if (userRole === 'ADMIN' || userRole === 'MANAGER') {
          console.log('✅ [LOGIN 9] Usuario ADMIN/MANAGER - Redirigiendo a /admin/dashboard');
          // Usuario administrador o manager - redirigir al dashboard admin
          navigate('/admin/dashboard');
        } else if (userRole === 'CAJERO') {
          console.log('ℹ️ [LOGIN 10] Usuario CAJERO - Redirigiendo a /cajero/orders');
          // Usuario cajero - redirigir a módulo de cajero
          navigate('/cajero/orders');
        } else {
          console.log('ℹ️ [LOGIN 10] Usuario regular - Redirigiendo a home');
          // Usuario regular - redirigir a home con carousel de recomendaciones
          navigate('/');
        }
      } else {
        console.warn('⚠️ [LOGIN 11] Login falló:', result.error);
      }
    } catch (err) {
      console.error('❌ [LOGIN ERROR] Error en login:', err);
    } finally {
      console.log('🔷 [LOGIN 12] Finalizando (setIsLoading false)');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <LogIn className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Iniciar Sesión
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Ingresa tu usuario"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Ingresa tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Iniciar Sesión</span>
                </div>
              )}
            </button>
          </form>

          {/* Botones de Autocompletar (solo desarrollo) */}
          {import.meta.env.DEV && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-600 text-center">🚀 Autocompletar (Dev):</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({username: 'admin', password: 'admin123'})}
                  className="py-2 px-3 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
                >
                  👑 Admin
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({username: 'juan_cliente', password: 'juan123'})}
                  className="py-2 px-3 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                >
                  👤 Juan (Cliente)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({username: 'laura_cliente', password: 'laura123'})}
                  className="py-2 px-3 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                >
                  👤 Laura (Cliente)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({username: 'carlos_manager', password: 'carlos123'})}
                  className="py-2 px-3 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  👔 Carlos (Manager)
                </button>
              </div>
            </div>
          )}

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 font-medium mb-2">📋 Credenciales de prueba:</p>
            
            <div className="mb-3">
              <p className="text-xs text-blue-800 font-semibold mb-1">👑 Administrador:</p>
              <p className="text-xs text-blue-700">Usuario: <span className="font-mono">admin</span> | Contraseña: <span className="font-mono">admin123</span></p>
            </div>
            
            <div>
              <p className="text-xs text-blue-800 font-semibold mb-1">👥 Clientes:</p>
              <p className="text-xs text-blue-700">Usuario: <span className="font-mono">juan_cliente</span> | Contraseña: <span className="font-mono">juan123</span></p>
              <p className="text-xs text-blue-700">Usuario: <span className="font-mono">laura_cliente</span> | Contraseña: <span className="font-mono">laura123</span></p>
            </div>
            
            <div className="mt-2 pt-2 border-t border-blue-200">
              <p className="text-xs text-blue-600 italic">⚠️ Patrón: username completo, password solo el nombre + 123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;