import { useState } from 'react';
import { reportService } from '../../services/api';
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  Package,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  DollarSign,
  ShoppingCart,
  Users
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://98.92.49.243/api';

export default function AdminReports() {
  const [loading, setLoading] = useState(false);
  const [salesDates, setSalesDates] = useState({
    start_date: '',
    end_date: ''
  });
  
  // Estados para vista previa
  const [salesPreview, setSalesPreview] = useState(null);
  const [productsPreview, setProductsPreview] = useState(null);
  const [showSalesPreview, setShowSalesPreview] = useState(false);
  const [showProductsPreview, setShowProductsPreview] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  
  // Log de configuración inicial
  console.log('📌 [INIT] AdminReports cargado con reportService');

  // Función para obtener vista previa de ventas
  const previewSalesReport = async () => {
    console.log('👁️ [PREVIEW] Iniciando vista previa de ventas');
    
    // Validar fechas
    if (!salesDates.start_date || !salesDates.end_date) {
      alert('⚠️ Por favor selecciona un rango de fechas');
      return;
    }

    if (new Date(salesDates.start_date) > new Date(salesDates.end_date)) {
      alert('❌ La fecha inicial debe ser menor que la fecha final');
      return;
    }

    setLoadingPreview(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_URL}/reports/sales/preview/?start_date=${salesDates.start_date}&end_date=${salesDates.end_date}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener vista previa');
      }

      const data = await response.json();
      console.log('✅ [PREVIEW] Datos recibidos:', data);
      setSalesPreview(data);
      setShowSalesPreview(true);
    } catch (err) {
      console.error('❌ [PREVIEW ERROR]:', err);
      alert('❌ Error al obtener vista previa del reporte');
    } finally {
      setLoadingPreview(false);
    }
  };

  // Función para obtener vista previa de productos
  const previewProductsReport = async () => {
    console.log('👁️ [PREVIEW] Iniciando vista previa de productos');
    
    setLoadingPreview(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${API_URL}/reports/products/preview/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener vista previa');
      }

      const data = await response.json();
      console.log('✅ [PREVIEW] Datos recibidos:', data);
      setProductsPreview(data);
      setShowProductsPreview(true);
    } catch (err) {
      console.error('❌ [PREVIEW ERROR]:', err);
      alert('❌ Error al obtener vista previa del reporte');
    } finally {
      setLoadingPreview(false);
    }
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
      console.log('🔷 [7] Llamando a reportService.generateSalesReport()');
      console.log('🔷 [8] Parámetros:', {
        startDate: salesDates.start_date,
        endDate: salesDates.end_date,
        format: format
      });
      
      const blob = await reportService.generateSalesReport(
        salesDates.start_date,
        salesDates.end_date,
        format
      );
      
      console.log('✅ [9] Blob recibido, tamaño:', blob.size);
      
      const filename = generateFilename('ventas', format === 'excel' ? 'xlsx' : 'pdf', salesDates);
      console.log('🔷 [10] Nombre de archivo:', filename);
      
      downloadFile(blob, filename);
      console.log('✅ [11] Descarga completada');
      
      alert(`✅ Reporte de ventas generado exitosamente (${format.toUpperCase()})`);
    } catch (err) {
      console.error('❌ [ERROR] Error en reporte de ventas:', err);
      console.error('❌ [ERROR] Mensaje:', err.message);
      alert('❌ Error al generar el reporte de ventas');
    } finally {
      setLoading(false);
    }
  };

  // Generar Reporte de Productos
  const generateProductsReport = async (format) => {
    console.log('🟢 [1] Iniciando generación de reporte de productos');
    console.log('🟢 [2] Formato solicitado:', format);
    
    setLoading(true);

    try {
      console.log('🟢 [3] Llamando a reportService.generateProductsReport()');
      
      const blob = await reportService.generateProductsReport(format);
      
      console.log('✅ [4] Blob recibido, tamaño:', blob.size);

      const filename = generateFilename('productos', format === 'excel' ? 'xlsx' : 'pdf');
      console.log('🟢 [5] Nombre de archivo:', filename);
      
      downloadFile(blob, filename);
      console.log('✅ [6] Descarga completada');
      
      alert(`✅ Reporte de productos generado exitosamente (${format.toUpperCase()})`);
    } catch (err) {
      console.error('❌ [ERROR PRODUCTOS] Error:', err);
      console.error('❌ [ERROR PRODUCTOS] Mensaje:', err.message);
      alert('❌ Error al generar el reporte de productos');
    } finally {
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
            <div className="space-y-3">
              {/* Botón de Vista Previa */}
              <button
                onClick={previewSalesReport}
                disabled={loadingPreview}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {loadingPreview ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Cargando Vista Previa...
                  </>
                ) : (
                  <>
                    <Eye className="h-5 w-5" />
                    👁️ Vista Previa
                  </>
                )}
              </button>

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

            {/* Botones */}
            <div className="space-y-3">
              {/* Botón de Vista Previa */}
              <button
                onClick={previewProductsReport}
                disabled={loadingPreview}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {loadingPreview ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Cargando Vista Previa...
                  </>
                ) : (
                  <>
                    <Eye className="h-5 w-5" />
                    👁️ Vista Previa
                  </>
                )}
              </button>

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

      {/* Modal de Vista Previa de Ventas */}
      {showSalesPreview && salesPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-6 w-6" />
                <div>
                  <h3 className="text-xl font-bold">Vista Previa - Reporte de Ventas</h3>
                  <p className="text-purple-100 text-sm">
                    {salesPreview.start_date} a {salesPreview.end_date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSalesPreview(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Estadísticas Resumen */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Órdenes</p>
                      <p className="text-2xl font-bold text-gray-900">{salesPreview.total_orders}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Ventas</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${parseFloat(salesPreview.total_revenue).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Promedio por Orden</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${(parseFloat(salesPreview.total_revenue) / salesPreview.total_orders).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {salesPreview.orders.map((order) => (
                  <div key={order.order_id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Orden #{order.order_id}</p>
                          <p className="text-sm text-gray-500">{order.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">${order.total}</p>
                        <p className="text-sm text-gray-500">{order.items_count} items</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-700">{order.customer}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600">{order.customer_email}</span>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-3">
                        <p className="text-xs font-medium text-gray-500 mb-2">PRODUCTOS:</p>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-white rounded flex items-center justify-center text-xs font-bold text-purple-600">
                                  {item.quantity}x
                                </span>
                                <span className="text-gray-700">{item.product}</span>
                              </div>
                              <span className="font-medium text-gray-900">${item.subtotal}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer con Botones */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {salesPreview.orders.length} de {salesPreview.total_orders} órdenes
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => generateSalesReport('pdf')}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </button>
                <button
                  onClick={() => generateSalesReport('excel')}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Descargar Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vista Previa de Productos */}
      {showProductsPreview && productsPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-6 w-6" />
                <div>
                  <h3 className="text-xl font-bold">Vista Previa - Reporte de Inventario</h3>
                  <p className="text-blue-100 text-sm">Productos activos en el sistema</p>
                </div>
              </div>
              <button
                onClick={() => setShowProductsPreview(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Estadísticas Resumen */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Productos</p>
                      <p className="text-2xl font-bold text-gray-900">{productsPreview.total_products}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Stock Total</p>
                      <p className="text-2xl font-bold text-gray-900">{productsPreview.total_stock}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valor Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${parseFloat(productsPreview.total_value).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de Productos */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productsPreview.products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{product.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${product.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.stock < 10 
                              ? 'bg-red-100 text-red-800' 
                              : product.stock < 50 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {product.stock} unidades
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          ${product.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer con Botones */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {productsPreview.products.length} productos
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => generateProductsReport('pdf')}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </button>
                <button
                  onClick={() => generateProductsReport('excel')}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Descargar Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
