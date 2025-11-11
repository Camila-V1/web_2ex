import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  User,
  Globe,
  Activity,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Eye,
  X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://98.92.49.243/api';

const AdminAudit = () => {
  // Estados principales
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Estados de filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    severity: '',
    username: '',
    ip_address: '',
    start_date: '',
    end_date: '',
    success: '',
    search: '',
    object_type: '',
    object_id: ''
  });

  // Estado de log seleccionado (modal de detalle)
  const [selectedLog, setSelectedLog] = useState(null);

  // Tipos de acciones disponibles
  const actionTypes = [
    'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
    'USER_CREATE', 'USER_UPDATE', 'USER_DELETE',
    'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE', 'PRODUCT_VIEW',
    'ORDER_CREATE', 'ORDER_UPDATE', 'ORDER_DELETE', 'ORDER_PAYMENT', 'ORDER_CANCEL',
    'REPORT_GENERATE', 'REPORT_DOWNLOAD',
    'NLP_QUERY', 'SYSTEM_ERROR', 'PERMISSION_DENIED', 'DATA_EXPORT'
  ];

  const severityLevels = ['INFO', 'WARNING', 'ERROR', 'CRITICAL'];
  const objectTypes = ['User', 'Product', 'Order', 'Category', 'Report'];

  // Cargar logs con filtros
  const fetchLogs = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    
    try {
      // ✅ PASO 1: Obtener token de localStorage
      const token = localStorage.getItem('access_token');
      
      // ✅ PASO 2: Debug - verificar token
      console.log('🔍 [TOKEN] Token encontrado:', token ? 'Sí' : 'No');
      if (token) {
        console.log('🔍 [TOKEN] Primeros 20 caracteres:', token.substring(0, 20) + '...');
        console.log('🔍 [TOKEN] Longitud total:', token.length);
      }
      
      // ✅ PASO 3: Verificar que existe
      if (!token) {
        console.error('❌ [TOKEN] No hay token en localStorage');
        setError('No autenticado. Por favor inicia sesión.');
        // Opcional: redirigir a login (descomentar si usas useNavigate)
        // navigate('/login');
        return;
      }
      
      // ✅ PASO 4: Construir query params
      const params = new URLSearchParams({ page: pageNum });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const url = `${API_URL}/audit/?${params.toString()}`;
      console.log('🔍 [REQUEST] URL completa:', url);

      // ✅ PASO 5: Hacer petición con Authorization header
      console.log('🔍 [REQUEST] Enviando petición...');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // ← CRÍTICO: "Bearer " con espacio
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 [RESPONSE] Status:', response.status, response.statusText);

      // ✅ PASO 6: Manejar errores de autenticación
      if (response.status === 401) {
        console.error('❌ [AUTH] Token inválido o expirado');
        
        // Intentar refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          console.log('🔄 [AUTH] Intentando renovar token...');
          
          const refreshResponse = await fetch(`${API_URL}/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken })
          });
          
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem('access_token', data.access);
            console.log('✅ [AUTH] Token renovado, reintentando petición...');
            // Reintentar fetchLogs
            return fetchLogs(pageNum);
          }
        }
        
        // Si llegamos aquí, el refresh falló
        console.error('❌ [AUTH] No se pudo renovar token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setError('Sesión expirada. Por favor inicia sesión nuevamente.');
        return;
      }

      // ✅ PASO 7: Verificar otros errores
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || 
          `Error ${response.status}: ${response.statusText}`
        );
      }

      // ✅ PASO 8: Procesar respuesta exitosa
      const data = await response.json();
      console.log('✅ [AUDIT] Response completa:', data);
      console.log('✅ [AUDIT] data.results:', data.results);
      console.log('✅ [AUDIT] data.count:', data.count);
      console.log('✅ [AUDIT] Cantidad de logs:', data.results?.length);
      
      // ✅ PASO 9: Actualizar estado
      setLogs(data.results || []);
      setTotalLogs(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / 20)); // 20 items por página
      setPage(pageNum);
      
      console.log('✅ [AUDIT] Estado actualizado correctamente');
      
    } catch (err) {
      console.error('❌ [ERROR] Error al obtener logs:', err);
      setError(err.message || 'Error al cargar logs');
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      console.log('📊 [STATS] Obteniendo estadísticas...');
      console.log('📊 [STATS] Token disponible:', token ? 'Sí' : 'No');
      
      if (!token) {
        console.error('❌ [STATS] No hay token');
        return;
      }
      
      const response = await fetch(`${API_URL}/audit/stats/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 [STATS] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [STATS] Estadísticas recibidas:', data);
        setStats(data);
      } else {
        console.error('❌ [STATS] Error en response:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('❌ [STATS] Error al obtener estadísticas:', err);
    }
  };

  // Cargar datos al montar
  useEffect(() => {
    fetchLogs(1);
    fetchStats();
  }, []);

  // Aplicar filtros
  const applyFilters = () => {
    fetchLogs(1);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      action: '',
      severity: '',
      username: '',
      ip_address: '',
      start_date: '',
      end_date: '',
      success: '',
      search: '',
      object_type: '',
      object_id: ''
    });
    setPage(1);
  };

  // Exportar a PDF
  const exportToPDF = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('❌ No autenticado. Por favor inicia sesión.');
        return;
      }
      
      console.log('📄 [PDF] Descargando PDF...');
      
      // Construir query params con filtros actuales
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`${API_URL}/audit/export_pdf/?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auditoria_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log('✅ [PDF] Descargado correctamente');
      alert('✅ PDF descargado correctamente');
    } catch (err) {
      console.error('❌ [PDF] Error:', err);
      alert('❌ Error al exportar PDF: ' + err.message);
    }
  };

  // Exportar a Excel
  const exportToExcel = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('❌ No autenticado. Por favor inicia sesión.');
        return;
      }
      
      console.log('📊 [EXCEL] Descargando Excel...');
      
      // Construir query params con filtros actuales
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`${API_URL}/audit/export_excel/?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auditoria_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log('✅ [EXCEL] Descargado correctamente');
      alert('✅ Excel descargado correctamente');
    } catch (err) {
      console.error('❌ [EXCEL] Error:', err);
      alert('❌ Error al exportar Excel: ' + err.message);
    }
  };

  // Obtener icono según severidad
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'INFO':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'CRITICAL':
        return <XCircle className="w-5 h-5 text-red-700" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  // Obtener color según severidad
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'INFO':
        return 'bg-blue-100 text-blue-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      case 'CRITICAL':
        return 'bg-red-200 text-red-900 font-bold';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener color según estado de éxito
  const getSuccessColor = (success) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="w-8 h-8 text-blue-600" />
          Sistema de Auditoría
        </h1>
        <p className="text-gray-600">
          Registro completo de actividad del sistema con exportación a PDF/Excel
        </p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Logs</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total_logs}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Últimas 24h</p>
                <p className="text-2xl font-bold text-green-900">{stats.last_24_hours}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Exitosos</p>
                <p className="text-2xl font-bold text-purple-900">{stats.success_count}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Errores</p>
                <p className="text-2xl font-bold text-red-900">{stats.error_count}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Barra de acciones */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>

          <button
            onClick={() => fetchLogs(page)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>

          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>

          <div className="ml-auto text-sm text-gray-600">
            Total: <span className="font-bold">{totalLogs}</span> registros
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Búsqueda
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Búsqueda general */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Búsqueda General
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Buscar en descripción, IP, usuario..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tipo de acción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Acción
              </label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las acciones</option>
                {actionTypes.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            {/* Severidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severidad
              </label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las severidades</option>
                {severityLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filters.success}
                onChange={(e) => setFilters({ ...filters, success: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="true">Exitosos</option>
                <option value="false">Fallidos</option>
              </select>
            </div>

            {/* Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                type="text"
                value={filters.username}
                onChange={(e) => setFilters({ ...filters, username: e.target.value })}
                placeholder="Nombre de usuario"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* IP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección IP
              </label>
              <input
                type="text"
                value={filters.ip_address}
                onChange={(e) => setFilters({ ...filters, ip_address: e.target.value })}
                placeholder="127.0.0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tipo de objeto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Objeto
              </label>
              <select
                value={filters.object_type}
                onChange={(e) => setFilters({ ...filters, object_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                {objectTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Fecha inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Fecha fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={applyFilters}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Search className="w-4 h-4" />
              Aplicar Filtros
            </button>

            <button
              onClick={() => {
                clearFilters();
                fetchLogs(1);
              }}
              className="flex items-center gap-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {error}
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Cargando registros...</span>
        </div>
      )}

      {/* Tabla de logs */}
      {!loading && logs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {log.username || 'Anónimo'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        {log.ip_address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 w-fit ${getSeverityColor(log.severity)}`}>
                        {getSeverityIcon(log.severity)}
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Página <span className="font-medium">{page}</span> de{' '}
                <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchLogs(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => fetchLogs(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sin resultados */}
      {!loading && logs.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron registros
          </h3>
          <p className="text-gray-600">
            {Object.values(filters).some(v => v) 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Aún no hay actividad registrada en el sistema'}
          </p>
          <button
            onClick={() => {
              console.log('🔍 [DEBUG] Estado actual:');
              console.log('  - loading:', loading);
              console.log('  - logs:', logs);
              console.log('  - logs.length:', logs.length);
              console.log('  - totalLogs:', totalLogs);
              console.log('  - stats:', stats);
              console.log('  - error:', error);
              console.log('  - filters:', filters);
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🔍 Ver Estado en Consola
          </button>
        </div>
      )}

      {/* Modal de detalle */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Detalles del Registro
                </h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Contenido */}
              <div className="space-y-4">
                {/* Información básica */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      ID
                    </label>
                    <p className="text-gray-900">{selectedLog.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Fecha/Hora
                    </label>
                    <p className="text-gray-900">{formatDate(selectedLog.timestamp)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Acción
                    </label>
                    <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded">
                      {selectedLog.action}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Severidad
                    </label>
                    <span className={`px-3 py-1 text-sm font-medium rounded flex items-center gap-1 w-fit ${getSeverityColor(selectedLog.severity)}`}>
                      {getSeverityIcon(selectedLog.severity)}
                      {selectedLog.severity}
                    </span>
                  </div>
                </div>

                {/* Usuario e IP */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Usuario
                    </label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {selectedLog.username || 'Anónimo'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Dirección IP
                    </label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      {selectedLog.ip_address}
                    </p>
                  </div>
                </div>

                {/* Estado y método */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Estado
                    </label>
                    <p className={`flex items-center gap-2 font-medium ${getSuccessColor(selectedLog.success)}`}>
                      {selectedLog.success ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Exitoso
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          Fallido
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Método HTTP
                    </label>
                    <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded">
                      {selectedLog.method}
                    </span>
                  </div>
                </div>

                {/* Ruta */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Ruta
                  </label>
                  <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">
                    {selectedLog.path}
                  </p>
                </div>

                {/* User Agent */}
                {selectedLog.user_agent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      User Agent
                    </label>
                    <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded break-all">
                      {selectedLog.user_agent}
                    </p>
                  </div>
                )}

                {/* Descripción */}
                {selectedLog.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Descripción
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded">
                      {selectedLog.description}
                    </p>
                  </div>
                )}

                {/* Objeto afectado */}
                {selectedLog.object_type && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Tipo de Objeto
                      </label>
                      <p className="text-gray-900">{selectedLog.object_type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        ID del Objeto
                      </label>
                      <p className="text-gray-900">{selectedLog.object_id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Representación
                      </label>
                      <p className="text-gray-900">{selectedLog.object_repr}</p>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {selectedLog.error_message && (
                  <div>
                    <label className="block text-sm font-medium text-red-500 mb-1">
                      Mensaje de Error
                    </label>
                    <p className="text-red-900 bg-red-50 p-3 rounded border border-red-200">
                      {selectedLog.error_message}
                    </p>
                  </div>
                )}

                {/* Extra data */}
                {selectedLog.extra_data && Object.keys(selectedLog.extra_data).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Datos Adicionales
                    </label>
                    <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto">
                      {JSON.stringify(selectedLog.extra_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAudit;
