import React, { useState } from 'react';
import axios from 'axios';
import { Mic, FileText, Send, Loader2, Download } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://98.92.49.243/api';

const AIReportGenerator = () => {
  const [command, setCommand] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // 📅 Selector de fechas opcional
  const [useDates, setUseDates] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Obtener headers de autenticación
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // Generar reporte con comando de texto o voz
  const generateReport = async (userCommand) => {
    if (!userCommand.trim()) {
      setError('Por favor ingresa un comando');
      return;
    }

    // Validar fechas si están activadas
    if (useDates) {
      if (!startDate || !endDate) {
        setError('⚠️ Por favor selecciona ambas fechas');
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        setError('❌ La fecha inicial debe ser menor que la fecha final');
        return;
      }
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(false);
    
    // Agregar fechas al comando si están seleccionadas
    let finalCommand = userCommand;
    if (useDates && startDate && endDate) {
      finalCommand = `${userCommand} del ${startDate} al ${endDate}`;
      console.log('📅 Comando con fechas:', finalCommand);
    }
    
    setLastCommand(finalCommand);

    try {
      console.log('🤖 Enviando comando:', finalCommand);

      const response = await axios.post(
        `${API_URL}/reports/dynamic-parser/`,
        { prompt: finalCommand },
        {
          headers: getAuthHeaders(),
          responseType: 'blob', // IMPORTANTE para descargas
        }
      );

      console.log('✅ Reporte generado exitosamente');

      // Obtener nombre del archivo desde headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'reporte.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Crear enlace de descarga
      // FIX: response.data YA es un Blob, no necesita new Blob([...])
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setCommand('');
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(false), 5000);

    } catch (err) {
      console.error('❌ Error al generar reporte:', err);
      
      if (err.response?.status === 401) {
        setError('No estás autenticado. Por favor inicia sesión.');
      } else if (err.response?.status === 403) {
        setError('No tienes permisos de administrador.');
      } else if (err.response?.status === 400) {
        setError('No pude entender el comando. Por favor intenta de nuevo.');
      } else {
        setError('Error al generar el reporte. Intenta nuevamente.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Iniciar reconocimiento de voz
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      console.log('🎤 Escuchando...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('📝 Comando detectado:', transcript);
      setCommand(transcript);
      generateReport(transcript);
    };

    recognition.onerror = (event) => {
      console.error('❌ Error de reconocimiento:', event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        setError('No se detectó ningún audio. Intenta de nuevo.');
      } else if (event.error === 'not-allowed') {
        setError('Permiso de micrófono denegado.');
      } else {
        setError(`Error: ${event.error}`);
      }
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
    generateReport(command);
  };

  // Comandos de ejemplo
  const exampleCommands = [
    'Reporte de ventas en PDF',
    'Ventas en excel',
    'Dame el reporte de productos en PDF',
    'Inventario en excel',
    'Necesito el reporte de inventario en PDF',
  ];

  const useExample = (example) => {
    setCommand(example);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-indigo-600" />
          🤖 Generador de Reportes con IA
        </h1>
        <p className="text-gray-600">
          Genera reportes usando comandos de texto o voz en lenguaje natural
        </p>
      </div>

      {/* Formulario Principal */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Checkbox para usar fechas */}
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="useDates"
              checked={useDates}
              onChange={(e) => setUseDates(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="useDates" className="text-sm font-medium text-gray-700">
              📅 Especificar rango de fechas (opcional)
            </label>
          </div>

          {/* Selector de Fechas */}
          {useDates && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Input de Comando */}
          <div>
            <label htmlFor="command" className="block text-sm font-medium text-gray-700 mb-2">
              Comando
            </label>
            <div className="flex gap-2">
              <input
                id="command"
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Ej: Quiero un reporte de ventas de octubre en PDF"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isListening || isGenerating}
              />
              
              {/* Botón de Voz */}
              <button
                type="button"
                onClick={startVoiceRecognition}
                disabled={isListening || isGenerating}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Comando por voz"
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* Botón de Enviar */}
              <button
                type="submit"
                disabled={!command.trim() || isGenerating || isListening}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Generar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Estado de Escucha */}
          {isListening && (
            <div className="flex items-center gap-2 text-red-600 animate-pulse">
              <Mic className="w-5 h-5" />
              <span className="font-medium">Escuchando... Habla ahora</span>
            </div>
          )}
        </form>

        {/* Mensajes de Estado */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">❌ {error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <Download className="w-5 h-5" />
              <p className="font-medium">✅ Reporte generado y descargado exitosamente</p>
            </div>
            {lastCommand && (
              <p className="text-sm text-green-700 mt-1">
                Comando: "{lastCommand}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Ejemplos de Comandos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          💡 Ejemplos de comandos
        </h2>
        <div className="space-y-2">
          {exampleCommands.map((example, index) => (
            <button
              key={index}
              onClick={() => useExample(example)}
              disabled={isGenerating || isListening}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-gray-700">{example}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Información Adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ ¿Cómo funciona?</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>Tipos de reporte:</strong> Ventas o Productos/Inventario</li>
          <li>• <strong>Formatos:</strong> PDF o Excel</li>
          <li>• <strong>Fechas:</strong> Activa "📅 Especificar rango de fechas" para seleccionar período específico</li>
          <li>• <strong>Sin fechas:</strong> Si no especificas, el sistema usa datos del mes actual</li>
          <li>• <strong>Comandos simples:</strong> "Ventas en PDF", "Productos en excel", etc.</li>
          <li>• <strong>Comando por voz:</strong> Click en el micrófono y habla tu comando</li>
        </ul>
      </div>

      {/* Compatibilidad de Voz */}
      {!('webkitSpeechRecognition' in window) && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Nota:</strong> El reconocimiento de voz solo funciona en Chrome y Edge.
            Puedes usar comandos de texto en cualquier navegador.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIReportGenerator;
