import React, { useState } from 'react';
import { Mic, Send, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { nlpService } from '../../services/api';
import { useCart } from '../../contexts/CartContext';

const VoiceCartAssistant = () => {
  const [command, setCommand] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const { refreshCart } = useCart();

  // Procesar comando NLP
  const processCommand = async (userCommand) => {
    if (!userCommand.trim()) {
      setMessage({ type: 'error', text: 'Por favor ingresa un comando' });
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      console.log('🤖 Procesando comando NLP:', userCommand);
      
      const response = await nlpService.addToCartNaturalLanguage(userCommand);
      
      console.log('✅ Respuesta del servidor:', response);

      // Refrescar carrito si es necesario
      if (refreshCart) {
        refreshCart();
      }

      // Mostrar mensaje de éxito
      if (response.message) {
        setMessage({ 
          type: 'success', 
          text: response.message,
          products: response.products || []
        });
      }

      setCommand('');
      
      // Limpiar mensaje después de 8 segundos
      setTimeout(() => setMessage(null), 8000);

    } catch (err) {
      console.error('❌ Error al procesar comando:', err);
      
      let errorText = 'No pude entender el comando. Intenta de nuevo.';
      
      if (err.response?.data?.error) {
        errorText = err.response.data.error;
      } else if (err.response?.status === 400) {
        errorText = 'No encontré productos con ese nombre. Intenta ser más específico.';
      } else if (err.response?.status === 401) {
        errorText = 'Necesitas iniciar sesión para usar esta función.';
      }

      setMessage({ type: 'error', text: errorText });
      
      // Limpiar mensaje de error después de 8 segundos
      setTimeout(() => setMessage(null), 8000);

    } finally {
      setIsProcessing(false);
    }
  };

  // Iniciar reconocimiento de voz
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setMessage({ 
        type: 'error', 
        text: 'Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.' 
      });
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setMessage({ type: 'info', text: '🎤 Escuchando... Habla ahora' });
      console.log('🎤 Escuchando...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('📝 Comando detectado:', transcript);
      setCommand(transcript);
      setMessage(null);
      processCommand(transcript);
    };

    recognition.onerror = (event) => {
      console.error('❌ Error de reconocimiento:', event.error);
      setIsListening(false);
      
      let errorText = 'Error al reconocer voz';
      
      if (event.error === 'no-speech') {
        errorText = 'No se detectó ningún audio. Intenta de nuevo.';
      } else if (event.error === 'not-allowed') {
        errorText = 'Permiso de micrófono denegado.';
      } else if (event.error === 'audio-capture') {
        errorText = 'No se detectó micrófono.';
      }

      setMessage({ type: 'error', text: errorText });
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('🎤 Reconocimiento terminado');
    };

    recognition.start();
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    processCommand(command);
  };

  // Ejemplos de comandos
  const exampleCommands = [
    'Agrega 2 laptops al carrito',
    'Quiero 3 smartphones',
    'Añade una tablet',
    'Dame 5 auriculares',
  ];

  const useExample = (example) => {
    setCommand(example);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-600 rounded-lg">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Asistente de Carrito con IA
          </h3>
          <p className="text-sm text-gray-600">
            Agrega productos usando comandos de voz o texto natural
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder='Ej: "Agrega 2 laptops al carrito"'
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            disabled={isListening || isProcessing}
          />
          
          {/* Botón de Voz */}
          <button
            type="button"
            onClick={startVoiceRecognition}
            disabled={isListening || isProcessing}
            className={`px-4 py-3 rounded-lg font-medium transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Comando por voz"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={!command.trim() || isProcessing || isListening}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="hidden sm:inline">Procesando...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Enviar</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Mensajes de Estado */}
      {message && (
        <div className={`p-4 rounded-lg mb-4 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 border border-red-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start gap-2">
            {message.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
            {message.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
            {message.type === 'info' && <Mic className="w-5 h-5 text-blue-600 mt-0.5" />}
            
            <div className="flex-1">
              <p className={`font-medium ${
                message.type === 'success' ? 'text-green-800' :
                message.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {message.text}
              </p>
              
              {message.products && message.products.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.products.map((product, idx) => (
                    <p key={idx} className="text-sm text-green-700">
                      ✓ {product.name} x{product.quantity}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ejemplos de comandos */}
      <div>
        <p className="text-xs font-medium text-gray-700 mb-2">💡 Ejemplos de comandos:</p>
        <div className="flex flex-wrap gap-2">
          {exampleCommands.map((example, index) => (
            <button
              key={index}
              onClick={() => useExample(example)}
              disabled={isProcessing || isListening}
              className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>

      {/* Compatibilidad de Voz */}
      {!('webkitSpeechRecognition' in window) && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            ⚠️ El reconocimiento de voz solo funciona en Chrome y Edge.
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceCartAssistant;
