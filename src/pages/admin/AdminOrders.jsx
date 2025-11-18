import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { 
  ShoppingCart, 
  Loader2, 
  Calendar,
  User,
  Package,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Search
} from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  
  // 📄 Paginación del BACKEND (no frontend)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 50; // ✅ CAMBIADO: 50 órdenes por página

  // 🔍 Estados de filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    loadOrders(currentPage);
  }, [currentPage]);

  const loadOrders = async (page = 1) => {
    try {
      setLoading(true);
      console.log(`📄 [ADMIN ORDERS] Cargando página ${page} con filtros:`, filters);
      
      const response = await adminService.getAllOrders(page, pageSize, filters);
      
      // Verificar si la respuesta es paginada de DRF
      if (response.results) {
        console.log(`📊 [ADMIN ORDERS] Página ${page}: ${response.results.length} de ${response.count} órdenes totales`);
        
        setOrders(response.results);
        setTotalCount(response.count);
        setTotalPages(Math.ceil(response.count / pageSize));
      } else if (Array.isArray(response)) {
        // Fallback: respuesta directa sin paginación
        console.log(`📄 [ADMIN ORDERS] ${response.length} órdenes (sin paginación)`);
        setOrders(response);
        setTotalCount(response.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      alert('❌ Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await adminService.updateOrderStatus(orderId, newStatus);
      alert('✅ Estado actualizado');
      // Recargar solo la página actual
      loadOrders(currentPage);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Error al actualizar estado');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('¿Eliminar esta orden?')) return;
    try {
      await adminService.deleteOrder(orderId);
      alert('✅ Orden eliminada');
      // Recargar solo la página actual
      loadOrders(currentPage);
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('❌ Error al eliminar orden');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      SHIPPED: 'bg-blue-100 text-blue-800',
      DELIVERED: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // 📄 Navegación de páginas del backend
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🔍 Aplicar filtros
  const applyFilters = () => {
    console.log('✅ [FILTERS] Aplicando filtros:', filters);
    setCurrentPage(1);
    loadOrders(1);
  };

  // 🗑️ Limpiar filtros
  const clearFilters = () => {
    console.log('🗑️ [FILTERS] Limpiando filtros');
    setFilters({
      status: '',
      start_date: '',
      end_date: ''
    });
    setCurrentPage(1);
  };

  // Recargar cuando se limpien los filtros
  useEffect(() => {
    if (!filters.status && !filters.start_date && !filters.end_date) {
      loadOrders(currentPage);
    }
  }, [filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <ShoppingCart className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Gestión de Órdenes</h1>
            <p className="text-gray-600">
              {totalCount > 0 ? `${totalCount} órdenes totales` : 'Cargando...'}
            </p>
          </div>
        </div>

        {/* Botón de filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </button>
      </div>

      {/* 🔍 Panel de Filtros */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtrar Órdenes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="PAID">Pagado</option>
                <option value="SHIPPED">Enviado</option>
                <option value="DELIVERED">Entregado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>

            {/* Fecha inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Fecha fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={applyFilters}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              Aplicar Filtros
            </button>

            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
              Limpiar Filtros
            </button>
          </div>
        </div>
      )}

      {/* 📊 Info de paginación del backend */}
      <div className="mb-4 text-sm text-gray-600">
        Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} de {totalCount} órdenes
        {(filters.status || filters.start_date || filters.end_date) && (
          <span className="ml-2 text-indigo-600 font-medium">(Filtrado)</span>
        )}
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">Orden #{order.id}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Usuario #{order.user}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">
                  ${parseFloat(order.total_amount || order.total_price || 0).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium">Estado:</span>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                disabled={updatingStatus === order.id}
                className={`px-4 py-2 rounded-lg font-medium ${getStatusColor(order.status)}`}
              >
                <option value="PENDING">Pendiente</option>
                <option value="PAID">Pagado</option>
                <option value="SHIPPED">Enviado</option>
                <option value="DELIVERED">Entregado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
              {updatingStatus === order.id && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Productos:</h4>
              {(order.items || []).length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-2">
                    <span>
                      {item.product?.name || item.product_name || `Producto #${item.product?.id || item.product}`}
                    </span>
                    <span className="text-gray-600">
                      {item.quantity} x ${parseFloat(item.price || 0).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic py-2">No hay productos en esta orden</p>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => deleteOrder(order.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 📄 Controles de Paginación */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {/* Botón Anterior */}
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>

          {/* Números de Página */}
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              
              // Mostrar solo páginas relevantes (primera, última, actuales +/- 2)
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      currentPage === pageNumber
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              }
              
              // Mostrar "..." para páginas omitidas
              if (
                pageNumber === currentPage - 3 ||
                pageNumber === currentPage + 3
              ) {
                return (
                  <span key={pageNumber} className="px-2 py-2 text-gray-400">
                    ...
                  </span>
                );
              }
              
              return null;
            })}
          </div>

          {/* Botón Siguiente */}
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 📊 Resumen de página actual */}
      {totalPages > 1 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Página {currentPage} de {totalPages}
        </div>
      )}
    </div>
  );
}
