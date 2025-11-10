import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletService } from '../../services/api';
import { Wallet, Loader2 } from 'lucide-react';

export default function WalletWidget() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    loadBalance();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadBalance = async () => {
    try {
      const data = await walletService.getMyBalance();
      setBalance(data.balance);
      setHasWallet(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setHasWallet(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // No mostrar si no tiene billetera
  if (!hasWallet || balance === null) {
    return null;
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
