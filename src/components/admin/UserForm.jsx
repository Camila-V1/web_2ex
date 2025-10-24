import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

export default function UserForm({ user, isEditMode, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    role: 'cliente'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Pre-cargar datos si es modo edición
  useEffect(() => {
    if (isEditMode && user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '', // No pre-cargar password
        password2: '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role || 'cliente'
      });
    }
  }, [isEditMode, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username
    if (!formData.username.trim()) {
      newErrors.username = 'El username es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El username debe tener al menos 3 caracteres';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Password (solo requerido al crear)
    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (formData.password !== formData.password2) {
        newErrors.password2 = 'Las contraseñas no coinciden';
      }
    }

    // First Name
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }

    // Last Name
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }

    // Role
    if (!formData.role) {
      newErrors.role = 'El rol es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Preparar datos según el modo
      let dataToSend = { ...formData };
      
      if (isEditMode) {
        // En modo edición, no enviar password si está vacío
        if (!dataToSend.password) {
          delete dataToSend.password;
          delete dataToSend.password2;
        }
        await onSubmit(user.id, dataToSend);
      } else {
        // En modo creación, enviar todo
        await onSubmit(dataToSend);
      }

      // Si llegamos aquí, fue exitoso
      onClose();
    } catch (error) {
      console.error('Error en formulario:', error);
      // El error ya se maneja en el componente padre
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isEditMode} // No editable en modo edición
              className={`w-full px-4 py-2 border-2 rounded-lg transition-colors ${
                errors.username 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              } ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''} outline-none`}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border-2 rounded-lg transition-colors ${
                errors.email 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              } outline-none`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* First Name */}
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border-2 rounded-lg transition-colors ${
                errors.first_name 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              } outline-none`}
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border-2 rounded-lg transition-colors ${
                errors.last_name 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              } outline-none`}
            />
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-4 py-2 border-2 rounded-lg transition-colors ${
                errors.role 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:border-blue-500'
              } outline-none`}
            >
              <option value="cliente">Cliente</option>
              <option value="vendedor">Vendedor</option>
              <option value="empleado">Empleado</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-500">{errors.role}</p>
            )}
          </div>

          {/* Password (solo mostrar al crear) */}
          {!isEditMode && (
            <>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full px-4 py-2 border-2 rounded-lg transition-colors ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:border-blue-500'
                  } outline-none`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password2"
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border-2 rounded-lg transition-colors ${
                    errors.password2 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:border-blue-500'
                  } outline-none`}
                />
                {errors.password2 && (
                  <p className="mt-1 text-sm text-red-500">{errors.password2}</p>
                )}
              </div>
            </>
          )}

          {isEditMode && (
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm text-blue-700">
                💡 Deja los campos de contraseña vacíos si no deseas cambiarla
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {isEditMode ? 'Actualizar' : 'Crear Usuario'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
