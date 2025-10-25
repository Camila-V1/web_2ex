import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { 
  ShoppingCart, 
  Loader2, 
  Calendar,
  User,
  Package,
  Trash2,
  Edit
} from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
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
      loadOrders();
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
      loadOrders();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <ShoppingCart className="h-8 w-8 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-bold">Gestión de Órdenes</h1>
          <p className="text-gray-600">{orders.length} órdenes totales</p>
        </div>
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
                  ${parseFloat(order.total_amount).toFixed(2)}
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
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2">
                  <span>{item.product_name || `Producto #${item.product}`}</span>
                  <span className="text-gray-600">
                    {item.quantity} x ${parseFloat(item.price).toFixed(2)}
                  </span>
                </div>
              ))}
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
    </div>
  );
}
