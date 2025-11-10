import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { returnService } from '../../services/api';
import { 
  RotateCcw, 
  Package, 
  AlertCircle, 
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Eye,
  Filter
} from 'lucide-react';

export default function MyReturns() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};
      const response = await returnService.getReturns(params);
      setReturns(response.results || response);
      setError(null);
    } catch (err) {
      console.error('Error fetching returns:', err);
      setError('Error al cargar las devoluciones');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      REQUESTED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      IN_EVALUATION: 'bg-blue-100 text-blue-800 border-blue-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      COMPLETED: 'bg-purple-100 text-purple-800 border-purple-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      REQUESTED: <Clock className="h-4 w-4" />,
      IN_EVALUATION: <Package className="h-4 w-4" />,
      APPROVED: <CheckCircle className="h-4 w-4" />,
      COMPLETED: <CheckCircle className="h-4 w-4" />,
      REJECTED: <XCircle className="h-4 w-4" />,
      CANCELLED: <XCircle className="h-4 w-4" />
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      REQUESTED: 'Solicitada',
      IN_EVALUATION: 'En Evaluación',
      APPROVED: 'Aprobada',
      COMPLETED: 'Completada',
      REJECTED: 'Rechazada',
      CANCELLED: 'Cancelada'
    };
    return labels[status] || status;
  };

  const viewDetails = (returnId) => {
    navigate(`/returns/${returnId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando devoluciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <RotateCcw className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Devoluciones</h1>
              <p className="text-gray-600">
                Historial y estado de tus solicitudes de devolución
              </p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/orders')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            Nueva Devolución
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtrar por Estado</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {['ALL', 'REQUESTED', 'IN_EVALUATION', 'COMPLETED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'Todas' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Error</h4>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Devoluciones */}
      {returns.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <RotateCcw className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No tienes devoluciones {statusFilter !== 'ALL' ? 'con este estado' : 'aún'}
          </h3>
          <p className="text-gray-600 mb-6">
            {statusFilter !== 'ALL' 
              ? 'Intenta seleccionar otro filtro'
              : 'Puedes solicitar una devolución desde tus órdenes entregadas'
            }
          </p>
          {statusFilter !== 'ALL' ? (
            <button
              onClick={() => setStatusFilter('ALL')}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Ver Todas
            </button>
          ) : (
            <button
              onClick={() => navigate('/orders')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Ver Mis Órdenes
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((returnItem) => (
            <div
              key={returnItem.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Devolución #{returnItem.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Orden #{returnItem.order} • {new Date(returnItem.requested_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(returnItem.status)}`}>
                    {getStatusIcon(returnItem.status)}
                    {returnItem.status_display || getStatusLabel(returnItem.status)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {/* Información del Producto */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Producto</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {returnItem.product_details?.name || `Producto #${returnItem.product}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          Cantidad: {returnItem.quantity}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Información de la Devolución */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Detalles</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-gray-500">Razón:</span>{' '}
                        <span className="font-medium text-gray-900">
                          {returnItem.reason_display}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-500">Método:</span>{' '}
                        <span className="font-medium text-gray-900">
                          {returnItem.refund_method_display || returnItem.refund_method}
                        </span>
                      </p>
                      {returnItem.refund_amount && parseFloat(returnItem.refund_amount) > 0 && (
                        <p>
                          <span className="text-gray-500">Reembolso:</span>{' '}
                          <span className="font-bold text-green-600">
                            ${parseFloat(returnItem.refund_amount).toFixed(2)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline de Estados */}
                <div className="mb-4 bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Progreso</h4>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      returnItem.requested_at ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <CheckCircle className="h-3 w-3" />
                      Solicitada
                    </div>
                    <div className="flex-1 h-1 bg-gray-200 rounded">
                      <div 
                        className={`h-full rounded transition-all ${
                          returnItem.evaluated_at ? 'bg-green-500 w-full' : 'bg-gray-200 w-0'
                        }`}
                      />
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      returnItem.evaluated_at ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {returnItem.evaluated_at ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      Evaluada
                    </div>
                    <div className="flex-1 h-1 bg-gray-200 rounded">
                      <div 
                        className={`h-full rounded transition-all ${
                          returnItem.completed_at ? 'bg-green-500 w-full' : 'bg-gray-200 w-0'
                        }`}
                      />
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      returnItem.completed_at ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {returnItem.completed_at ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      Completada
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                {returnItem.description && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tu Descripción</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      {returnItem.description}
                    </p>
                  </div>
                )}

                {/* Notas de Evaluación (si existen) */}
                {returnItem.evaluation_notes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Notas del Manager</h4>
                    <p className="text-sm text-gray-600 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      {returnItem.evaluation_notes}
                    </p>
                  </div>
                )}

                {/* Botón Ver Detalles */}
                <button
                  onClick={() => viewDetails(returnItem.id)}
                  className="w-full bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg hover:bg-indigo-100 transition-colors inline-flex items-center justify-center gap-2 font-medium"
                >
                  <Eye className="h-4 w-4" />
                  Ver Detalles Completos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">Información sobre el proceso</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Las devoluciones se revisan en 24-48 horas</li>
              <li>Recibirás notificaciones por email sobre cambios de estado</li>
              <li>Los reembolsos a billetera son instantáneos</li>
              <li>Los reembolsos a método original toman 3-5 días hábiles</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
