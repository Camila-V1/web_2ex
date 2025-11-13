import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletService } from '../../services/api';
import { Wallet, Loader2, AlertCircle } from 'lucide-react';

export default function WalletWidget() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasWallet, setHasWallet] = useState(false);
  const [hasError, setHasError] = useState(false);
  const retryCountRef = useRef(0);

  useEffect(() => {
    loadBalance();
    
    // Solo actualizar si NO hay error persistente
    const interval = setInterval(() => {
      if (retryCountRef.current < 3) {
        loadBalance();
      }
    }, 60000); // Cambiar a 60 segundos para reducir spam
    
    return () => clearInterval(interval);
  }, []);

  const loadBalance = async () => {
    try {
      const data = await walletService.getMyBalance();
      setBalance(data.balance);
      setHasWallet(true);
      setHasError(false);
      retryCountRef.current = 0; // Reset contador al tener éxito
    } catch (err) {
      console.error('[WalletWidget] Error cargando balance:', err.message);
      
      // Si es 404, el usuario no tiene wallet
      if (err.response?.status === 404) {
        setHasWallet(false);
        setHasError(false);
      } 
      // Si es CORS o error de red, incrementar contador
      else if (!err.response || err.message.includes('CORS') || err.message.includes('Network')) {
        retryCountRef.current++;
        setHasError(true);
        
        // Si falla 3 veces, ocultar widget
        if (retryCountRef.current >= 3) {
          console.warn('[WalletWidget] Demasiados errores CORS/Network, ocultando widget');
          setHasWallet(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // No mostrar si no tiene billetera o hay demasiados errores
  if (!hasWallet || (balance === null && !hasError)) {
    return null;
  }

  // Mostrar indicador de error si hay problemas CORS pero queremos mantener visible
  if (hasError && retryCountRef.current < 3) {
    return (
      <button
        onClick={() => navigate('/wallet')}
        className="relative flex items-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all shadow-md"
        title="Error conectando con billetera (CORS)"
      >
        <AlertCircle className="h-5 w-5" />
        <span className="text-xs">Wallet Error</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate('/wallet')}
      className="relative flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
      title="Mi Billetera Virtual"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <Wallet className="h-5 w-5" />
          <span className="font-bold text-sm">
            ${parseFloat(balance).toFixed(2)}
          </span>
        </>
      )}
    </button>
  );
}
