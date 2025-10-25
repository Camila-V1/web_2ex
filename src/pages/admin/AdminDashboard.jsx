import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { predictionService } from '../../services/api';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package, 
  DollarSign,
  AlertCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  Brain,
  Calendar
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
    fetchPredictions();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/api/orders/admin/dashboard/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictions = async () => {
    try {
      setLoadingPredictions(true);
      const data = await predictionService.getSalesPredictions();
      setPredictions(data);
    } catch (err) {
      console.error('Error fetching predictions:', err);
      // No mostrar error, las predicciones son opcionales
    } finally {
      setLoadingPredictions(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  const growthIsPositive = stats?.sales?.growth_percentage >= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Administración</h1>
        <p className="text-gray-600">Resumen general de SmartSales365</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Ventas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className={`text-sm font-medium ${growthIsPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
              {growthIsPositive ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
              {Math.abs(stats?.sales?.growth_percentage || 0).toFixed(1)}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Ventas Totales</h3>
          <p className="text-2xl font-bold text-gray-900">
            ${(stats?.overview?.total_revenue || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Este mes: ${(stats?.sales?.current_month_revenue || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Total Órdenes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Órdenes</h3>
          <p className="text-2xl font-bold text-gray-900">{stats?.overview?.total_orders || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Todas las órdenes registradas</p>
        </div>

        {/* Total Usuarios */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Usuarios</h3>
          <p className="text-2xl font-bold text-gray-900">{stats?.overview?.total_users || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Usuarios registrados</p>
        </div>

        {/* Total Productos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Productos</h3>
          <p className="text-2xl font-bold text-gray-900">{stats?.overview?.total_products || 0}</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats?.overview?.active_products || 0} activos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Productos más vendidos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
            Top 10 Productos Más Vendidos
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">
                    Producto
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3">
                    Vendidos
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3">
                    Ingresos
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats?.top_products?.slice(0, 10).map((product, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-900">
                      {product.product__name}
                    </td>
                    <td className="py-3 text-sm text-gray-600 text-right">
                      {product.total_sold}
                    </td>
                    <td className="py-3 text-sm font-medium text-green-600 text-right">
                      ${product.total_revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Órdenes por estado */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Órdenes por Estado</h2>
          <div className="space-y-4">
            {stats?.orders_by_status?.map((status, index) => {
              const total = stats.orders_by_status.reduce((acc, curr) => acc + curr.count, 0);
              const percentage = (status.count / total) * 100;
              
              const statusColors = {
                pending: 'bg-yellow-500',
                paid: 'bg-green-500',
                shipped: 'bg-blue-500',
                delivered: 'bg-purple-500',
                cancelled: 'bg-red-500'
              };

              const statusLabels = {
                pending: 'Pendiente',
                paid: 'Pagado',
                shipped: 'Enviado',
                delivered: 'Entregado',
                cancelled: 'Cancelado'
              };

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {statusLabels[status.status] || status.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {status.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${statusColors[status.status] || 'bg-gray-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Predicciones de Machine Learning */}
      {predictions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Predicciones de Ventas con IA</h2>
              <p className="text-purple-100">Pronóstico para los próximos 30 días basado en Machine Learning</p>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm font-medium">Próximos 7 días</span>
                </div>
                <p className="text-3xl font-bold">
                  ${predictions.slice(0, 7).reduce((sum, p) => sum + p.predicted_sales, 0).toFixed(2)}
                </p>
                <p className="text-sm text-purple-100 mt-1">Ventas estimadas</p>
              </div>
              
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm font-medium">Próximos 15 días</span>
                </div>
                <p className="text-3xl font-bold">
                  ${predictions.slice(0, 15).reduce((sum, p) => sum + p.predicted_sales, 0).toFixed(2)}
                </p>
                <p className="text-sm text-purple-100 mt-1">Ventas estimadas</p>
              </div>
              
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm font-medium">Próximos 30 días</span>
                </div>
                <p className="text-3xl font-bold">
                  ${predictions.reduce((sum, p) => sum + p.predicted_sales, 0).toFixed(2)}
                </p>
                <p className="text-sm text-purple-100 mt-1">Ventas estimadas</p>
              </div>
            </div>
            
            {/* Mini gráfico de predicciones */}
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-3">Tendencia de Predicción (30 días)</h3>
              <div className="flex items-end justify-between gap-1 h-32">
                {predictions.slice(0, 30).map((pred, index) => {
                  const maxPrediction = Math.max(...predictions.map(p => p.predicted_sales));
                  const height = (pred.predicted_sales / maxPrediction) * 100;
                  
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-white bg-opacity-40 hover:bg-opacity-60 transition-all rounded-t cursor-pointer group relative"
                      style={{ height: `${height}%`, minHeight: '10%' }}
                      title={`Día ${index + 1}: $${pred.predicted_sales.toFixed(2)}`}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        ${pred.predicted_sales.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs mt-2 text-purple-100">
                <span>Día 1</span>
                <span>Día 15</span>
                <span>Día 30</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-sm text-purple-100">
            <AlertCircle className="h-4 w-4" />
            <span>
              Modelo entrenado con Random Forest. Precisión estimada: 85%. 
              Actualizado cada 24 horas.
            </span>
          </div>
        </div>
      )}

      {loadingPredictions && (
        <div className="bg-gray-50 rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-indigo-600 animate-spin mr-3" />
            <span className="text-gray-600">Cargando predicciones de IA...</span>
          </div>
        </div>
      )}

      {/* Alertas de Stock Bajo */}
      {stats?.low_stock_products && stats.low_stock_products.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                ⚠️ Productos con Stock Bajo
              </h3>
              <p className="text-sm text-yellow-800 mb-4">
                Los siguientes productos tienen menos de 10 unidades en stock:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stats.low_stock_products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg p-3 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">ID: {product.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-600">{product.stock}</p>
                        <p className="text-xs text-gray-500">unidades</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Órdenes Recientes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Órdenes Recientes</h2>
          <Link
            to="/admin/orders"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Ver todas →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">
                  ID
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">
                  Usuario
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">
                  Estado
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3">
                  Total
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent_orders?.map((order) => {
                const statusColors = {
                  pending: 'bg-yellow-100 text-yellow-800',
                  paid: 'bg-green-100 text-green-800',
                  shipped: 'bg-blue-100 text-blue-800',
                  delivered: 'bg-purple-100 text-purple-800',
                  cancelled: 'bg-red-100 text-red-800'
                };

                return (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      Usuario {order.user}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm font-medium text-gray-900 text-right">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3 text-sm text-gray-600 text-right">
                      {new Date(order.created_at).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/products"
          className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 transition-colors text-center"
        >
          <Package className="h-6 w-6 mx-auto mb-2" />
          <span className="font-medium">Gestionar Productos</span>
        </Link>
        <Link
          to="/admin/orders"
          className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
        >
          <ShoppingCart className="h-6 w-6 mx-auto mb-2" />
          <span className="font-medium">Gestionar Órdenes</span>
        </Link>
        <Link
          to="/admin/users"
          className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
        >
          <Users className="h-6 w-6 mx-auto mb-2" />
          <span className="font-medium">Ver Usuarios</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;