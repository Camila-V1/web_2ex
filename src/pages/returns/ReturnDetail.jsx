import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { returnService } from '../../services/api';
import { 
  RotateCcw, 
  Package, 
  AlertCircle, 
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  ArrowLeft,
  Calendar,
  User,
  DollarSign,
  FileText
} from 'lucide-react';

export default function ReturnDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [returnData, setReturnData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReturnDetail();
  }, [id]);

  const fetchReturnDetail = async () => {
    try {
      setLoading(true);
      const data = await returnService.getReturn(id);
      setReturnData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching return detail:', err);
      setError('Error al cargar los detalles de la devolución');
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
      REQUESTED: <Clock className="h-5 w-5" />,
      IN_EVALUATION: <Package className="h-5 w-5" />,
      APPROVED: <CheckCircle className="h-5 w-5" />,
      COMPLETED: <CheckCircle className="h-5 w-5" />,
      REJECTED: <XCircle className="h-5 w-5" />,
      CANCELLED: <XCircle className="h-5 w-5" />
    };
    return icons[status] || <Clock className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (error || !returnData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Devolución no encontrada'}</p>
          <button
            onClick={() => navigate('/returns')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Volver a Mis Devoluciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/returns')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Mis Devoluciones
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <RotateCcw className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Devolución #{returnData.id}
              </h1>
              <p className="text-gray-600">
                Orden #{returnData.order}
              </p>
            </div>
          </div>
          
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(returnData.status)}`}>
            {getStatusIcon(returnData.status)}
            {returnData.status_display}
          </span>
        </div>
      </div>

      {/* Timeline de Progreso */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Progreso de la Devolución</h3>
        <div className="relative">
          {/* Línea de progreso */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ 
                width: returnData.status === 'COMPLETED' ? '100%' : 
                       returnData.status === 'REJECTED' ? '66%' :
                       returnData.evaluated_at ? '66%' : '33%' 
              }}
            />
          </div>

          {/* Pasos */}
          <div className="relative grid grid-cols-3 gap-4">
            {/* Paso 1: Solicitada */}
            <div className="text-center">
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-4 ${
                returnData.requested_at
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'bg-gray-200 border-gray-200'
              }`}>
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900">Solicitada</p>
              {returnData.requested_at && (
                <p className="text-xs text-gray-500">
                  {new Date(returnData.requested_at).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>

            {/* Paso 2: En Evaluación */}
            <div className="text-center">
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-4 ${
                returnData.evaluated_at
                  ? 'bg-indigo-600 border-indigo-600'
                  : returnData.status === 'IN_EVALUATION'
                  ? 'bg-blue-500 border-blue-500 animate-pulse'
                  : 'bg-gray-200 border-gray-200'
              }`}>
                {returnData.evaluated_at ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : (
                  <Package className="h-5 w-5 text-white" />
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900">En Evaluación</p>
              {returnData.evaluated_at && (
                <p className="text-xs text-gray-500">
                  {new Date(returnData.evaluated_at).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>

            {/* Paso 3: Completada/Rechazada */}
            <div className="text-center">
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-4 ${
                returnData.status === 'COMPLETED'
                  ? 'bg-green-600 border-green-600'
                  : returnData.status === 'REJECTED'
                  ? 'bg-red-600 border-red-600'
                  : 'bg-gray-200 border-gray-200'
              }`}>
                {returnData.status === 'COMPLETED' ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : returnData.status === 'REJECTED' ? (
                  <XCircle className="h-5 w-5 text-white" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900">
                {returnData.status === 'REJECTED' ? 'Rechazada' : 'Completada'}
              </p>
              {returnData.completed_at && (
                <p className="text-xs text-gray-500">
                  {new Date(returnData.completed_at).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Información */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Información del Producto */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            Información del Producto
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Producto</p>
              <p className="font-medium text-gray-900">
                {returnData.product_details?.name || `Producto #${returnData.product}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Precio</p>
              <p className="font-medium text-gray-900">
                ${parseFloat(returnData.product_details?.price || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cantidad</p>
              <p className="font-medium text-gray-900">{returnData.quantity} unidades</p>
            </div>
            {returnData.product_details?.category && (
              <div>
                <p className="text-sm text-gray-500">Categoría</p>
                <p className="font-medium text-gray-900">{returnData.product_details.category}</p>
              </div>
            )}
          </div>
        </div>

        {/* Información de la Orden */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Información de la Orden
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Número de Orden</p>
              <p className="font-medium text-gray-900">#{returnData.order}</p>
            </div>
            {returnData.order_details?.order_date && (
              <div>
                <p className="text-sm text-gray-500">Fecha de Compra</p>
                <p className="font-medium text-gray-900">
                  {new Date(returnData.order_details.order_date).toLocaleDateString('es-ES')}
                </p>
              </div>
            )}
            {returnData.order_details?.total_price && (
              <div>
                <p className="text-sm text-gray-500">Total de la Orden</p>
                <p className="font-medium text-gray-900">
                  ${parseFloat(returnData.order_details.total_price).toFixed(2)}
                </p>
              </div>
            )}
            {returnData.order_details?.status && (
              <div>
                <p className="text-sm text-gray-500">Estado de la Orden</p>
                <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {returnData.order_details.status}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detalles de la Devolución */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-indigo-600" />
          Detalles de la Devolución
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Razón</p>
            <p className="font-medium text-gray-900">{returnData.reason_display}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Método de Reembolso</p>
            <p className="font-medium text-gray-900">{returnData.refund_method_display}</p>
          </div>
          {returnData.refund_amount && parseFloat(returnData.refund_amount) > 0 && (
            <>
              <div>
                <p className="text-sm text-gray-500">Monto de Reembolso</p>
                <p className="font-bold text-green-600 text-lg">
                  ${parseFloat(returnData.refund_amount).toFixed(2)}
                </p>
              </div>
              {returnData.processed_at && (
                <div>
                  <p className="text-sm text-gray-500">Fecha de Procesamiento</p>
                  <p className="font-medium text-gray-900">
                    {new Date(returnData.processed_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Descripción del Cliente */}
      {returnData.description && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Tu Descripción del Problema</h3>
          <p className="text-gray-600 bg-gray-50 rounded-lg p-4">
            {returnData.description}
          </p>
        </div>
      )}

      {/* Notas del Manager */}
      {returnData.evaluation_notes && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Notas del Manager
          </h3>
          <div className={`rounded-lg p-4 ${
            returnData.status === 'REJECTED' 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <p className={`${
              returnData.status === 'REJECTED' ? 'text-red-700' : 'text-blue-700'
            }`}>
              {returnData.evaluation_notes}
            </p>
          </div>
        </div>
      )}

      {/* Mensaje de Estado */}
      {returnData.status === 'REQUESTED' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Solicitud en Proceso</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Un manager revisará tu solicitud en las próximas 24-48 horas. Te notificaremos por email cuando haya una actualización.
              </p>
            </div>
          </div>
        </div>
      )}

      {returnData.status === 'IN_EVALUATION' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">En Evaluación Física</h4>
              <p className="text-sm text-blue-700 mt-1">
                Tu devolución ha sido enviada a evaluación. Estamos verificando el estado del producto.
              </p>
            </div>
          </div>
        </div>
      )}

      {returnData.status === 'COMPLETED' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-800">Devolución Completada</h4>
              <p className="text-sm text-green-700 mt-1">
                Tu devolución ha sido aprobada y el reembolso de ${parseFloat(returnData.refund_amount).toFixed(2)} ha sido procesado.
                {returnData.refund_method === 'WALLET' && ' Puedes ver tu saldo en la sección de Billetera.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {returnData.status === 'REJECTED' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Devolución Rechazada</h4>
              <p className="text-sm text-red-700 mt-1">
                Tu solicitud de devolución ha sido rechazada. Revisa las notas del manager para más detalles.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
