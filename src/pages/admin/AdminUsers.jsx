import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import UserForm from '../../components/admin/UserForm';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://98.92.49.243/api';

  // Obtener token del localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  // Cargar usuarios
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/users/`, getAuthHeaders());
      // Filtrar para no mostrar al admin actual y otros admins
      const regularUsers = response.data.filter(user => !user.is_staff);
      setUsers(regularUsers);
      setFilteredUsers(regularUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error al cargar los usuarios. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrar usuarios por búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Crear usuario
  const handleCreateUser = async (userData) => {
    try {
      await axios.post(`${API_URL}/users/`, userData, getAuthHeaders());
      await fetchUsers(); // Recargar lista
      setShowForm(false);
      alert('✅ Usuario creado exitosamente');
    } catch (err) {
      console.error('Error creating user:', err);
      const errorMsg = err.response?.data?.username?.[0] || 
                       err.response?.data?.email?.[0] || 
                       'Error al crear usuario';
      alert(`❌ ${errorMsg}`);
      throw err; // Para que el formulario maneje el error
    }
  };

  // Actualizar usuario
  const handleUpdateUser = async (userId, userData) => {
    try {
      await axios.put(`${API_URL}/users/${userId}/`, userData, getAuthHeaders());
      await fetchUsers(); // Recargar lista
      setEditingUser(null);
      setIsEditMode(false);
      setShowForm(false);
      alert('✅ Usuario actualizado exitosamente');
    } catch (err) {
      console.error('Error updating user:', err);
      alert('❌ Error al actualizar usuario');
      throw err;
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (userId, username) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar al usuario "${username}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/users/${userId}/`, getAuthHeaders());
      await fetchUsers(); // Recargar lista
      alert('✅ Usuario eliminado exitosamente');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('❌ Error al eliminar usuario');
    }
  };

  // Abrir modal para editar
  const openEditModal = (user) => {
    setEditingUser(user);
    setIsEditMode(true);
    setShowForm(true);
  };

  // Abrir modal para crear
  const openCreateModal = () => {
    setEditingUser(null);
    setIsEditMode(false);
    setShowForm(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowForm(false);
    setEditingUser(null);
    setIsEditMode(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="mt-4 text-gray-600">Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-red-600" />
        <p className="mt-4 text-gray-600">{error}</p>
        <button 
          onClick={fetchUsers}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Users className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600">
              {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} registrado{filteredUsers.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <UserPlus className="h-5 w-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 outline-none text-base"
        />
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg">
          <Users className="h-16 w-16 text-gray-300" />
          <p className="mt-4 text-gray-600">No se encontraron usuarios</p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Username</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre Completo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900">{user.id}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-blue-600">{user.username}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'cliente' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'vendedor' ? 'bg-orange-100 text-orange-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="h-4 w-4" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          <XCircle className="h-4 w-4" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                          title="Editar usuario"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Formulario */}
      {showForm && (
        <UserForm
          user={editingUser}
          isEditMode={isEditMode}
          onSubmit={isEditMode ? handleUpdateUser : handleCreateUser}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
