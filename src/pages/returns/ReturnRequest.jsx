import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { returnService } from '../../services/api';
import { 
  RotateCcw, 
  Package, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';

export default function ReturnRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;

  const [formData, setFormData] = useState({
    order_id: order?.id || '',
    product_id: '',
    quantity: 1,
    reason: '',
    description: '',
    refund_method: 'WALLET'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const reasons = [
    { value: 'DEFECTIVE', label: 'Producto defectuoso' },
    { value: 'NOT_AS_DESCRIBED', label: 'No coincide con la descripción' },
    { value: 'WRONG_ITEM', label: 'Artículo incorrecto' },
    { value: 'DAMAGED_SHIPPING', label: 'Dañado en envío' },
    { value: 'CHANGED_MIND', label: 'Cambié de opinión' },
    { value: 'OTHER', label: 'Otra razón' }
  ];

  useEffect(() => {
    // Si no hay orden, redirigir a mis órdenes
    if (!order) {
      navigate('/orders');
    }
  }, [order, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('📤 Enviando solicitud de devolución:', formData);
      
      const result = await returnService.requestReturn(formData);
      
      console.log('✅ Devolución creada:', result);
      setSuccess(true);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/returns');
      }, 2000);
    } catch (err) {
      console.error('❌ Error al solicitar devolución:', err);
      setError(err.response?.data?.detail || err.response?.data?.error || 'Error al solicitar la devolución');
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Devolución Solicitada!
          </h2>
          <p className="text-gray-600 mb-4">
            Tu solicitud de devolución ha sido enviada exitosamente.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Te notificaremos por email cuando un manager la revise.
          </p>
          <button
            onClick={() => navigate('/returns')}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Ver Mis Devoluciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Mis Órdenes
        </button>
        
        <div className="flex items-center gap-4">
          <RotateCcw className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Solicitar Devolución</h1>
            <p className="text-gray-600">
              Completa el formulario para solicitar la devolución de tu producto
            </p>
          </div>
        </div>
      </div>

      {/* Información de la Orden */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Orden Seleccionada</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Número de Orden</p>
              <p className="font-medium text-gray-900">#{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de Compra</p>
              <p className="font-medium text-gray-900">
                {new Date(order.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {order.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-medium text-gray-900">
                ${parseFloat(order.total_amount).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleccionar Producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Producto a Devolver *
            </label>
            <select
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Seleccionar producto...</option>
              {order.items?.map((item) => (
                <option key={item.product} value={item.product}>
                  {item.product_name || `Producto #${item.product}`} - ${parseFloat(item.price).toFixed(2)} (Cantidad: {item.quantity})
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad a Devolver *
            </label>
            <input
              type="number"
              min="1"
              max={order.items?.find(item => item.product === parseInt(formData.product_id))?.quantity || 1}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Máximo: {order.items?.find(item => item.product === parseInt(formData.product_id))?.quantity || 0} unidades
            </p>
          </div>

          {/* Razón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razón de la Devolución *
            </label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Seleccionar razón...</option>
              {reasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Detallada del Problema *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explica detalladamente el motivo de la devolución. Incluye detalles específicos sobre el problema..."
              rows="5"
              minLength="20"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length} caracteres (mínimo 20)
            </p>
          </div>

          {/* Método de Reembolso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Método de Reembolso *
            </label>
            <div className="space-y-3">
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.refund_method === 'WALLET' 
                  ? 'border-indigo-600 bg-indigo-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  value="WALLET"
                  checked={formData.refund_method === 'WALLET'}
                  onChange={(e) => setFormData({ ...formData, refund_method: e.target.value })}
                  className="h-4 w-4 text-indigo-600"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">💰 Billetera Virtual</p>
                  <p className="text-sm text-gray-600">
                    Reembolso instantáneo en tu billetera para futuras compras (Recomendado)
                  </p>
                </div>
              </label>

              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.refund_method === 'ORIGINAL' 
                  ? 'border-indigo-600 bg-indigo-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  value="ORIGINAL"
                  checked={formData.refund_method === 'ORIGINAL'}
                  onChange={(e) => setFormData({ ...formData, refund_method: e.target.value })}
                  className="h-4 w-4 text-indigo-600"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">💳 Método de Pago Original</p>
                  <p className="text-sm text-gray-600">
                    Reembolso a tu tarjeta/cuenta original (3-5 días hábiles)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Error al solicitar devolución</h4>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Información Importante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-2">Información Importante</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Las devoluciones solo son válidas dentro de los 30 días posteriores a la entrega</li>
                  <li>Un manager revisará tu solicitud en las próximas 24-48 horas</li>
                  <li>Te notificaremos por email sobre el estado de tu devolución</li>
                  <li>El producto debe estar en condiciones originales para ser aceptado</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.product_id || !formData.reason || formData.description.length < 20}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <RotateCcw className="h-5 w-5" />
                  Solicitar Devolución
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
