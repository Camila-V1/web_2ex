import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService, reportService } from '../services/api';
import { 
  ShoppingBag, 
  Download, 
  Calendar,
  DollarSign,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  RotateCcw
} from 'lucide-react';

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders();
      setOrders(response);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      setDownloadingInvoice(orderId);
      console.log('📄 Descargando factura para orden:', orderId);
      
      const blob = await reportService.getInvoice(orderId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura_orden_${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Factura descargada exitosamente');
    } catch (err) {
      console.error('❌ Error downloading invoice:', err);
      alert('❌ Error al descargar la factura');
    } finally {
      setDownloadingInvoice(null);
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

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <Clock className="h-4 w-4" />,
      PAID: <CheckCircle className="h-4 w-4" />,
      SHIPPED: <Truck className="h-4 w-4" />,
      DELIVERED: <Package className="h-4 w-4" />,
      CANCELLED: <XCircle className="h-4 w-4" />
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Pendiente',
      PAID: 'Pagado',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado'
    };
    return labels[status] || status;
  };

  const canRequestReturn = (order) => {
    // Solo se puede solicitar devolución si está DELIVERED
    if (order.status !== 'DELIVERED') {
      return false;
    }
    
    // Usar created_at ya que updated_at no está disponible
    // En producción, el backend debería incluir delivery_date o updated_at
    const orderDate = new Date(order.created_at);
    const now = new Date();
    const daysSinceOrder = (now - orderDate) / (1000 * 60 * 60 * 24);
    
    // Permitir devoluciones dentro de 30 días desde la creación de la orden
    return daysSinceOrder <= 30;
  };

  const handleRequestReturn = (order) => {
    // Navegar a la página de solicitud de devolución con los datos de la orden
    navigate('/returns/new', { state: { order } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando órdenes...</p>
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
            onClick={fetchOrders}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <ShoppingBag className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Órdenes</h1>
            <p className="text-gray-600">
              Historial de tus compras y pedidos
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Órdenes */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No tienes órdenes aún
          </h3>
          <p className="text-gray-600 mb-6">
            Empieza a comprar y tus pedidos aparecerán aquí
          </p>
          <a
            href="/products"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Ver Productos
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Encabezado de la Orden */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold mb-2">Orden #{order.id}</h3>
                    <div className="flex items-center gap-4 text-sm text-indigo-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-indigo-100 mb-1">Total</div>
                    <div className="text-2xl font-bold">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido de la Orden */}
              <div className="p-6">
                {/* Estado */}
                <div className="flex justify-between items-center mb-4">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </span>

                  <div className="flex gap-2">
                    {/* Botón de Solicitar Devolución (solo si está DELIVERED y dentro de 30 días) */}
                    {canRequestReturn(order) && (
                      <button
                        onClick={() => handleRequestReturn(order)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Solicitar Devolución
                      </button>
                    )}

                    {/* Botón de Descargar Factura */}
                    <button
                      onClick={() => downloadInvoice(order.id)}
                      disabled={downloadingInvoice === order.id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-60"
                    >
                      {downloadingInvoice === order.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Descargando...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Descargar Factura
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Items de la Orden */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 mb-3">Productos:</h4>
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {item.product_image_url ? (
                            <img 
                              src={item.product_image_url} 
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                              }}
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.product_name || `Producto #${item.product}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            Cantidad: {item.quantity} x ${parseFloat(item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${(item.quantity * parseFloat(item.price)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumen */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span className="text-indigo-600">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
