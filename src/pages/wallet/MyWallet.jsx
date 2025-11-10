import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletService } from '../../services/api';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCcw
} from 'lucide-react';

export default function MyWallet() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [hasWallet, setHasWallet] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, [filterType]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      
      // Cargar balance
      try {
        const balanceData = await walletService.getMyBalance();
        setWallet(balanceData);
        setHasWallet(true);
      } catch (err) {
        if (err.response?.status === 404) {
          setHasWallet(false);
        } else {
          throw err;
        }
      }

      // Cargar transacciones
      const params = filterType !== 'ALL' ? { type: filterType } : {};
      const txData = await walletService.getMyTransactions(params);
      setTransactions(txData.results || txData);

      // Cargar estadísticas
      const statsData = await walletService.getStatistics();
      setStats(statsData);

      setError(null);
    } catch (err) {
      console.error('Error loading wallet:', err);
      setError('Error al cargar la billetera');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    const icons = {
      REFUND: <ArrowUpCircle className="h-5 w-5 text-green-500" />,
      DEPOSIT: <ArrowUpCircle className="h-5 w-5 text-blue-500" />,
      WITHDRAWAL: <ArrowDownCircle className="h-5 w-5 text-orange-500" />,
      PURCHASE: <ArrowDownCircle className="h-5 w-5 text-red-500" />
    };
    return icons[type] || <Activity className="h-5 w-5 text-gray-500" />;
  };

  const getTransactionColor = (isCredit) => {
    return isCredit ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando billetera...</p>
        </div>
      </div>
    );
  }

  // Si no tiene billetera
  if (!hasWallet) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Wallet className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            💰 Billetera Virtual
          </h2>
          <p className="text-gray-600 mb-2">
            Aún no tienes una billetera activa.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Se creará automáticamente cuando aprueban tu primera devolución con método "Billetera Virtual".
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/returns')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Ver Mis Devoluciones
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Ver Mis Órdenes
            </button>
          </div>
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
            <Wallet className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Billetera Virtual</h1>
              <p className="text-gray-600">
                Gestiona tu saldo y transacciones
              </p>
            </div>
          </div>
          
          <button
            onClick={loadWalletData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Actualizar
          </button>
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

      {/* Tarjeta de Saldo Principal */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl shadow-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-indigo-100 text-sm mb-1">Saldo Disponible</p>
            <h2 className="text-5xl font-bold">
              ${parseFloat(wallet?.balance || 0).toFixed(2)}
            </h2>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-4">
            <DollarSign className="h-12 w-12" />
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-indigo-100">
          <CheckCircle className="h-4 w-4" />
          <span>Billetera Activa • ID: {wallet?.wallet_id}</span>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Total Recibido</span>
            </div>
            <p className="text-3xl font-bold text-green-600">
              ${parseFloat(stats.total_credits).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Reembolsos y depósitos
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-sm text-gray-500">Total Gastado</span>
            </div>
            <p className="text-3xl font-bold text-red-600">
              ${parseFloat(stats.total_debits).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Compras y retiros
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-indigo-100 rounded-full p-3">
                <Activity className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="text-sm text-gray-500">Transacciones</span>
            </div>
            <p className="text-3xl font-bold text-indigo-600">
              {stats.transaction_count}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Operaciones realizadas
            </p>
          </div>
        </div>
      )}

      {/* Historial de Transacciones */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            📋 Historial de Transacciones
          </h3>
          
          {/* Filtros */}
          <div className="flex gap-2">
            {['ALL', 'REFUND', 'DEPOSIT', 'PURCHASE', 'WITHDRAWAL'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filterType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'ALL' ? 'Todas' : 
                 type === 'REFUND' ? 'Reembolsos' :
                 type === 'DEPOSIT' ? 'Depósitos' :
                 type === 'PURCHASE' ? 'Compras' : 'Retiros'}
              </button>
            ))}
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No hay transacciones
            </h4>
            <p className="text-gray-600">
              {filterType !== 'ALL' 
                ? 'No hay transacciones de este tipo'
                : 'Tus transacciones aparecerán aquí'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-white rounded-full p-2 shadow-sm">
                    {getTransactionIcon(tx.transaction_type)}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {tx.transaction_type_display}
                    </h4>
                    <p className="text-sm text-gray-600">{tx.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(tx.created_at).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-lg font-bold ${getTransactionColor(tx.is_credit)}`}>
                    {tx.is_credit ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Saldo: ${parseFloat(tx.balance_after).toFixed(2)}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                    tx.status === 'COMPLETED' 
                      ? 'bg-green-100 text-green-800'
                      : tx.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tx.status_display}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información Útil */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">💡 Información sobre tu billetera</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Tu saldo puede usarse para futuras compras</li>
              <li>Los reembolsos por devoluciones se agregan instantáneamente</li>
              <li>Puedes combinar tu saldo con otros métodos de pago</li>
              <li>Las transacciones se registran automáticamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
