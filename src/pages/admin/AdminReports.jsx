import { useState } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  Package,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminReports() {
  const [loading, setLoading] = useState(false);
  const [salesDates, setSalesDates] = useState({
    start_date: '',
    end_date: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  
  // Log de configuración inicial
  console.log('📌 [INIT] AdminReports cargado');
  console.log('📌 [INIT] API_URL configurada:', API_URL);
  console.log('📌 [INIT] VITE_API_URL env:', import.meta.env.VITE_API_URL);

  // Obtener token del localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    console.log('🔑 [AUTH] Obteniendo headers de autenticación');
    console.log('🔑 [AUTH] Token presente:', !!token);
    if (token) {
      console.log('🔑 [AUTH] Token preview:', token.substring(0, 30) + '...');
    }
    return {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob' // Importante para descargar archivos
    };
  };

  // Función para descargar archivo
  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Generar nombre de archivo
  const generateFilename = (type, format, dates = null) => {
    const timestamp = new Date().toISOString().split('T')[0];
    if (dates && dates.start_date && dates.end_date) {
      return `reporte_${type}_${dates.start_date}_${dates.end_date}.${format}`;
    }
    return `reporte_${type}_${timestamp}.${format}`;
  };

  // Generar Reporte de Ventas
  const generateSalesReport = async (format) => {
    console.log('🔷 [1] Iniciando generación de reporte de ventas');
    console.log('🔷 [2] Formato solicitado:', format);
    console.log('🔷 [3] Fechas seleccionadas:', salesDates);
    
    // Validar fechas
    if (!salesDates.start_date || !salesDates.end_date) {
      console.log('❌ [4] Validación fallida: Fechas vacías');
      alert('⚠️ Por favor selecciona un rango de fechas');
      return;
    }

    // Validar que start_date sea menor que end_date
    if (new Date(salesDates.start_date) > new Date(salesDates.end_date)) {
      console.log('❌ [5] Validación fallida: Fecha inicial > Fecha final');
      alert('❌ La fecha inicial debe ser menor que la fecha final');
      return;
    }

    console.log('✅ [6] Validaciones pasadas');
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      console.log('🔷 [7] Token obtenido:', token ? `${token.substring(0, 20)}...` : 'NO HAY TOKEN');
      
      const requestConfig = {
        ...getAuthHeaders(),
        params: {
          format: format,
          start_date: salesDates.start_date,
          end_date: salesDates.end_date
        }
      };
      
      const fullURL = `${API_URL}/reports/sales/`;
      console.log('🔷 [8] URL completa:', fullURL);
      console.log('🔷 [9] Parámetros:', requestConfig.params);
      console.log('🔷 [10] Headers:', requestConfig.headers);
      console.log('🔷 [11] responseType:', requestConfig.responseType);
      
      console.log('🔷 [12] Enviando petición GET...');
      const response = await axios.get(fullURL, requestConfig);
      
      console.log('✅ [13] Respuesta recibida');
      console.log('🔷 [14] Status:', response.status);
      console.log('🔷 [15] Headers de respuesta:', response.headers);
      console.log('🔷 [16] Tipo de data:', typeof response.data);
      console.log('🔷 [17] Tamaño de data:', response.data?.size || 'unknown');

      const filename = generateFilename('ventas', format === 'excel' ? 'xlsx' : 'pdf', salesDates);
      console.log('🔷 [18] Nombre de archivo generado:', filename);
      
      console.log('🔷 [19] Iniciando descarga...');
      downloadFile(response.data, filename);
      console.log('✅ [20] Descarga completada');
      
      alert(`✅ Reporte de ventas generado exitosamente (${format.toUpperCase()})`);
    } catch (err) {
      console.error('❌ [ERROR] Error en reporte de ventas:', err);
      console.error('❌ [ERROR] Mensaje:', err.message);
      console.error('❌ [ERROR] Response:', err.response);
      console.error('❌ [ERROR] Request:', err.request);
      console.error('❌ [ERROR] Config:', err.config);
      
      if (err.response) {
        console.error('❌ [ERROR] Status:', err.response.status);
        console.error('❌ [ERROR] Data:', err.response.data);
        console.error('❌ [ERROR] Headers:', err.response.headers);
      }
      
      alert('❌ Error al generar el reporte de ventas');
    } finally {
      console.log('🔷 [21] Finalizando (loading = false)');
      setLoading(false);
    }
  };

  // Generar Reporte de Productos
  const generateProductsReport = async (format) => {
    console.log('🟢 [1] Iniciando generación de reporte de productos');
    console.log('🟢 [2] Formato solicitado:', format);
    
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      console.log('🟢 [3] Token obtenido:', token ? `${token.substring(0, 20)}...` : 'NO HAY TOKEN');
      
      const requestConfig = {
        ...getAuthHeaders(),
        params: { format: format }
      };
      
      const fullURL = `${API_URL}/reports/products/`;
      console.log('🟢 [4] URL completa:', fullURL);
      console.log('🟢 [5] Parámetros:', requestConfig.params);
      console.log('🟢 [6] Headers:', requestConfig.headers);
      console.log('🟢 [7] responseType:', requestConfig.responseType);
      
      console.log('🟢 [8] Enviando petición GET...');
      const response = await axios.get(fullURL, requestConfig);
      
      console.log('✅ [9] Respuesta recibida');
      console.log('🟢 [10] Status:', response.status);
      console.log('🟢 [11] Headers de respuesta:', response.headers);
      console.log('🟢 [12] Tipo de data:', typeof response.data);
      console.log('🟢 [13] Tamaño de data:', response.data?.size || 'unknown');

      const filename = generateFilename('productos', format === 'excel' ? 'xlsx' : 'pdf');
      console.log('🟢 [14] Nombre de archivo generado:', filename);
      
      console.log('🟢 [15] Iniciando descarga...');
      downloadFile(response.data, filename);
      console.log('✅ [16] Descarga completada');
      
      alert(`✅ Reporte de productos generado exitosamente (${format.toUpperCase()})`);
    } catch (err) {
      console.error('❌ [ERROR PRODUCTOS] Error en reporte de productos:', err);
      console.error('❌ [ERROR PRODUCTOS] Mensaje:', err.message);
      console.error('❌ [ERROR PRODUCTOS] Response:', err.response);
      console.error('❌ [ERROR PRODUCTOS] Request:', err.request);
      console.error('❌ [ERROR PRODUCTOS] Config:', err.config);
      
      if (err.response) {
        console.error('❌ [ERROR PRODUCTOS] Status:', err.response.status);
        console.error('❌ [ERROR PRODUCTOS] Data:', err.response.data);
        console.error('❌ [ERROR PRODUCTOS] Headers:', err.response.headers);
      }
      
      alert('❌ Error al generar el reporte de productos');
    } finally {
      console.log('🟢 [17] Finalizando (loading = false)');
      setLoading(false);
    }
  };

  // Manejar cambio de fechas
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setSalesDates(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Establecer fecha de hoy
  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSalesDates({
      start_date: today,
      end_date: today
    });
  };

  // Establecer mes actual
  const setCurrentMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setSalesDates({
      start_date: firstDay.toISOString().split('T')[0],
      end_date: lastDay.toISOString().split('T')[0]
    });
  };

  // Establecer año actual
  const setCurrentYear = () => {
    const today = new Date();
    setSalesDates({
      start_date: `${today.getFullYear()}-01-01`,
      end_date: `${today.getFullYear()}-12-31`
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <FileText className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
            <p className="text-gray-600">Genera reportes en PDF o Excel de ventas y productos</p>
          </div>
        </div>
      </div>

      {/* Reportes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Reporte de Ventas */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Reporte de Ventas</h2>
                <p className="text-purple-100">Genera reportes de ventas por período</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Filtros de Fecha */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="start_date" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4" />
                  Fecha Inicial
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={salesDates.start_date}
                  onChange={handleDateChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="end_date" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4" />
                  Fecha Final
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={salesDates.end_date}
                  onChange={handleDateChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={setToday}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-purple-600 hover:text-white transition-colors text-sm font-medium border-2 border-gray-200 hover:border-purple-600"
              >
                Hoy
              </button>
              <button
                onClick={setCurrentMonth}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-purple-600 hover:text-white transition-colors text-sm font-medium border-2 border-gray-200 hover:border-purple-600"
              >
                Este Mes
              </button>
              <button
                onClick={setCurrentYear}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-purple-600 hover:text-white transition-colors text-sm font-medium border-2 border-gray-200 hover:border-purple-600"
              >
                Este Año
              </button>
            </div>

            {/* Botones de Descarga */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => generateSalesReport('pdf')}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    PDF
                  </>
                )}
              </button>

              <button
                onClick={() => generateSalesReport('excel')}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Excel
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Incluye: Órdenes, clientes, totales y detalles de productos</span>
            </div>
          </div>
        </div>

        {/* Reporte de Productos */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Package className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Reporte de Inventario</h2>
                <p className="text-blue-100">Genera reportes del inventario de productos</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded mb-6">
              <p className="text-sm text-gray-700 leading-relaxed">
                Este reporte incluye todos los productos registrados en el sistema con 
                información detallada sobre stock, precios y categorías.
              </p>
            </div>

            {/* Botones de Descarga */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => generateProductsReport('pdf')}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    PDF
                  </>
                )}
              </button>

              <button
                onClick={() => generateProductsReport('excel')}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Excel
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Incluye: ID, nombre, categoría, precio, stock y estado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-blue-600" />
          Información sobre los Reportes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-l-4 border-red-500">
            <h4 className="text-lg font-bold text-gray-900 mb-2">📄 Formato PDF</h4>
            <p className="text-gray-700 leading-relaxed">
              Ideal para imprimir y presentaciones. Incluye gráficos y formato profesional.
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-l-4 border-green-500">
            <h4 className="text-lg font-bold text-gray-900 mb-2">📊 Formato Excel</h4>
            <p className="text-gray-700 leading-relaxed">
              Perfecto para análisis de datos. Puedes editar y crear gráficos personalizados.
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-500">
            <h4 className="text-lg font-bold text-gray-900 mb-2">🔒 Seguridad</h4>
            <p className="text-gray-700 leading-relaxed">
              Solo administradores pueden generar reportes. Todos los datos están protegidos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
