import { useState, useEffect } from 'react';
import { returnService } from '../../services/api';
import { 
  RotateCcw, 
  Package, 
  AlertCircle, 
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Filter,
  Eye,
  Send,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  User,
  DollarSign
} from 'lucide-react';

export default function ManagerReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [processingId, setProcessingId] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'approve' or 'reject'
  const [modalData, setModalData] = useState({
    evaluationNotes: '',
    refundAmount: 0
  });

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

  const handleSendToEvaluation = async (returnId) => {
    if (!confirm('¿Enviar esta devolución a evaluación física?')) return;

    try {
      setProcessingId(returnId);
      await returnService.sendToEvaluation(returnId);
      alert('✅ Devolución enviada a evaluación exitosamente');
      fetchReturns();
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Error al enviar a evaluación: ' + (err.response?.data?.detail || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const openModal = (returnItem, action) => {
    setSelectedReturn(returnItem);
    setModalAction(action);
    setModalData({
      evaluationNotes: '',
      refundAmount: returnItem.product_details?.price ? 
        parseFloat(returnItem.product_details.price) * returnItem.quantity : 0
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReturn(null);
    setModalAction(null);
    setModalData({ evaluationNotes: '', refundAmount: 0 });
  };

  const handleApprove = async () => {
    if (!modalData.evaluationNotes.trim()) {
      alert('Por favor ingresa notas de evaluación');
      return;
    }

    if (modalData.refundAmount <= 0) {
      alert('El monto de reembolso debe ser mayor a 0');
      return;
    }

    try {
      setProcessingId(selectedReturn.id);
      const result = await returnService.approveReturn(
        selectedReturn.id,
        modalData.evaluationNotes,
        modalData.refundAmount
      );
      
      alert(`✅ Devolución aprobada exitosamente!\n💰 Reembolso: $${result.refund_amount}`);
      closeModal();
      fetchReturns();
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Error al aprobar: ' + (err.response?.data?.detail || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!modalData.evaluationNotes.trim()) {
      alert('Por favor ingresa la razón del rechazo');
      return;
    }

    if (!confirm('¿Estás seguro de rechazar esta devolución?')) return;

    try {
      setProcessingId(selectedReturn.id);
      await returnService.rejectReturn(selectedReturn.id, modalData.evaluationNotes);
      alert('❌ Devolución rechazada');
      closeModal();
      fetchReturns();
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Error al rechazar: ' + (err.response?.data?.detail || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      REQUESTED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      IN_EVALUATION: 'bg-blue-100 text-blue-800 border-blue-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      COMPLETED: 'bg-purple-100 text-purple-800 border-purple-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      REQUESTED: <Clock className="h-4 w-4" />,
      IN_EVALUATION: <Package className="h-4 w-4" />,
      APPROVED: <CheckCircle className="h-4 w-4" />,
      COMPLETED: <CheckCircle className="h-4 w-4" />,
      REJECTED: <XCircle className="h-4 w-4" />
    };
    return icons[status] || <Clock className="h-4 w-4" />;
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
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 rounded-full p-3">
            <RotateCcw className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Devoluciones</h1>
            <p className="text-gray-600">
              Gestiona y procesa las solicitudes de devolución
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtrar por Estado</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {['ALL', 'REQUESTED', 'IN_EVALUATION', 'APPROVED', 'COMPLETED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? `Todas (${returns.length})` : 
               status === 'REQUESTED' ? 'Solicitadas' :
               status === 'IN_EVALUATION' ? 'En Evaluación' :
               status === 'APPROVED' ? 'Aprobadas' :
               status === 'COMPLETED' ? 'Completadas' : 'Rechazadas'}
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
            No hay devoluciones {statusFilter !== 'ALL' ? 'con este estado' : ''}
          </h3>
          <p className="text-gray-600">
            {statusFilter !== 'ALL' 
              ? 'Intenta seleccionar otro filtro'
              : 'Las solicitudes de devolución aparecerán aquí'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((returnItem) => (
            <div
              key={returnItem.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Devolución #{returnItem.id}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(returnItem.requested_at).toLocaleString('es-ES')}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {returnItem.customer_details?.full_name || returnItem.customer_details?.username}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(returnItem.status)}`}>
                    {getStatusIcon(returnItem.status)}
                    {returnItem.status_display}
                  </span>
                </div>

                {/* Información */}
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  {/* Producto */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Producto</p>
                    <p className="font-medium text-gray-900">
                      {returnItem.product_details?.name || `Producto #${returnItem.product}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cantidad: {returnItem.quantity}
                    </p>
                  </div>

                  {/* Razón */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Razón</p>
                    <p className="font-medium text-gray-900">{returnItem.reason_display}</p>
                    <p className="text-sm text-gray-600">{returnItem.refund_method_display}</p>
                  </div>

                  {/* Monto */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Precio del Producto</p>
                    <p className="text-lg font-bold text-indigo-600">
                      ${parseFloat(returnItem.product_details?.price || 0).toFixed(2)}
                    </p>
                    {returnItem.refund_amount && parseFloat(returnItem.refund_amount) > 0 && (
                      <p className="text-sm text-green-600 font-medium">
                        Reembolsado: ${parseFloat(returnItem.refund_amount).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Descripción del Cliente */}
                {returnItem.description && (
                  <div className="mb-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium mb-1">Descripción del Cliente:</p>
                    <p className="text-sm text-blue-900">{returnItem.description}</p>
                  </div>
                )}

                {/* Notas de Evaluación */}
                {returnItem.evaluation_notes && (
                  <div className={`mb-4 rounded-lg p-3 border ${
                    returnItem.status === 'REJECTED' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <p className={`text-xs font-medium mb-1 ${
                      returnItem.status === 'REJECTED' ? 'text-red-700' : 'text-green-700'
                    }`}>
                      Notas del Manager:
                    </p>
                    <p className={`text-sm ${
                      returnItem.status === 'REJECTED' ? 'text-red-900' : 'text-green-900'
                    }`}>
                      {returnItem.evaluation_notes}
                    </p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2">
                  {returnItem.status === 'REQUESTED' && (
                    <button
                      onClick={() => handleSendToEvaluation(returnItem.id)}
                      disabled={processingId === returnItem.id}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {processingId === returnItem.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Enviar a Evaluación
                        </>
                      )}
                    </button>
                  )}

                  {returnItem.status === 'IN_EVALUATION' && (
                    <>
                      <button
                        onClick={() => openModal(returnItem, 'approve')}
                        disabled={processingId === returnItem.id}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Aprobar
                      </button>
                      <button
                        onClick={() => openModal(returnItem, 'reject')}
                        disabled={processingId === returnItem.id}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Rechazar
                      </button>
                    </>
                  )}

                  {(returnItem.status === 'COMPLETED' || returnItem.status === 'REJECTED') && (
                    <div className="flex-1 text-center py-3 text-gray-500 text-sm">
                      {returnItem.status === 'COMPLETED' 
                        ? '✅ Devolución completada' 
                        : '❌ Devolución rechazada'
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Aprobar/Rechazar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`p-6 border-b ${
              modalAction === 'approve' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {modalAction === 'approve' ? (
                  <>
                    <ThumbsUp className="h-6 w-6 text-green-600" />
                    Aprobar Devolución #{selectedReturn.id}
                  </>
                ) : (
                  <>
                    <ThumbsDown className="h-6 w-6 text-red-600" />
                    Rechazar Devolución #{selectedReturn.id}
                  </>
                )}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Información del Producto */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-2">Información del Producto</p>
                <p className="font-medium text-gray-900">
                  {selectedReturn.product_details?.name}
                </p>
                <p className="text-sm text-gray-600">
                  Cantidad: {selectedReturn.quantity} • 
                  Precio unitario: ${parseFloat(selectedReturn.product_details?.price || 0).toFixed(2)}
                </p>
              </div>

              {/* Notas de Evaluación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {modalAction === 'approve' ? 'Notas de Evaluación *' : 'Razón del Rechazo *'}
                </label>
                <textarea
                  value={modalData.evaluationNotes}
                  onChange={(e) => setModalData({ ...modalData, evaluationNotes: e.target.value })}
                  placeholder={modalAction === 'approve' 
                    ? 'Describe el estado del producto y la justificación de la aprobación...'
                    : 'Explica por qué se rechaza la devolución...'
                  }
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {modalData.evaluationNotes.length} caracteres (mínimo 20)
                </p>
              </div>

              {/* Monto de Reembolso (solo para aprobar) */}
              {modalAction === 'approve' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto de Reembolso *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={modalData.refundAmount}
                      onChange={(e) => setModalData({ ...modalData, refundAmount: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Precio sugerido: ${parseFloat(selectedReturn.product_details?.price || 0).toFixed(2)} x {selectedReturn.quantity} = 
                    ${(parseFloat(selectedReturn.product_details?.price || 0) * selectedReturn.quantity).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={closeModal}
                disabled={processingId === selectedReturn.id}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={modalAction === 'approve' ? handleApprove : handleReject}
                disabled={processingId === selectedReturn.id || !modalData.evaluationNotes.trim() || 
                         (modalAction === 'approve' && modalData.refundAmount <= 0)}
                className={`flex-1 px-6 py-3 text-white rounded-lg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 ${
                  modalAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processingId === selectedReturn.id ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    {modalAction === 'approve' ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Aprobar Devolución
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5" />
                        Rechazar Devolución
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
