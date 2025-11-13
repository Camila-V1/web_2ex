import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { predictionService } from '../../services/api';
import { TrendingUp, BarChart3, Download, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

const SalesPredictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('line');
  const [stats, setStats] = useState({
    totalPredicted: 0,
    avgDaily: 0,
    maxDay: null,
    minDay: null,
  });

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await predictionService.getSalesPredictions();
      
      const processedData = data.predictions.map(pred => ({
        date: pred.date,
        sales: pred.predicted_sales,
        dayOfWeek: pred.day_of_week,
        formattedDate: format(parseISO(pred.date), 'dd MMM', { locale: es }),
      }));
      
      setPredictions(processedData);
      setModelInfo(data.model_info);
      
      const total = processedData.reduce((sum, p) => sum + p.sales, 0);
      const avg = total / processedData.length;
      const maxDay = processedData.reduce((max, p) => p.sales > max.sales ? p : max);
      const minDay = processedData.reduce((min, p) => p.sales < min.sales ? p : min);
      
      setStats({
        totalPredicted: total.toFixed(2),
        avgDaily: avg.toFixed(2),
        maxDay: maxDay,
        minDay: minDay,
      });
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar las predicciones. Asegúrate de que el modelo esté entrenado.');
      console.error('Error fetching predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Ventas Predichas', 'Día de la Semana'];
    const rows = predictions.map(p => [p.date, p.sales, p.dayOfWeek]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predicciones-ventas-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Cargando predicciones de IA...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <h3 className="text-xl font-bold text-red-900">Error al Cargar Predicciones</h3>
            </div>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={fetchPredictions}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <RefreshCw className="h-5 w-5" />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
                Predicciones de Ventas con IA
              </h1>
              <p className="text-gray-600 mt-2">
                Predicciones generadas por Machine Learning para los próximos 30 días
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Download className="h-5 w-5" />
                Exportar CSV
              </button>
              <button
                onClick={fetchPredictions}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <RefreshCw className="h-5 w-5" />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Predicho (30 días)</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPredicted}</p>
                <p className="text-xs text-gray-500 mt-1">unidades</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Promedio Diario</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgDaily}</p>
                <p className="text-xs text-gray-500 mt-1">unidades/día</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-3xl">🔝</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Mayor Demanda</p>
                <p className="text-2xl font-bold text-gray-900">{stats.maxDay?.formattedDate}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.maxDay?.sales.toFixed(2)} unidades</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <span className="text-3xl">📉</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Menor Demanda</p>
                <p className="text-2xl font-bold text-gray-900">{stats.minDay?.formattedDate}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.minDay?.sales.toFixed(2)} unidades</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('line')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'line'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📈 Gráfica de Línea
            </button>
            <button
              onClick={() => setViewMode('bar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'bar'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Gráfica de Barras
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Tendencia de Ventas Predichas</h3>
          <ResponsiveContainer width="100%" height={400}>
            {viewMode === 'line' ? (
              <LineChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="formattedDate" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ value: 'Unidades Predichas', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-900 bg-opacity-90 text-white p-4 rounded-lg shadow-xl">
                          <p className="font-bold text-lg mb-1">{data.formattedDate}</p>
                          <p className="text-gray-300 text-sm mb-2">{data.dayOfWeek}</p>
                          <p className="text-xl font-bold text-blue-300">
                            {data.sales.toFixed(2)} unidades
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  name="Ventas Predichas"
                  dot={{ fill: '#4f46e5', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="formattedDate" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ value: 'Unidades Predichas', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-900 bg-opacity-90 text-white p-4 rounded-lg shadow-xl">
                          <p className="font-bold text-lg mb-1">{data.formattedDate}</p>
                          <p className="text-gray-300 text-sm mb-2">{data.dayOfWeek}</p>
                          <p className="text-xl font-bold text-green-300">
                            {data.sales.toFixed(2)} unidades
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="sales" 
                  fill="#10b981" 
                  name="Ventas Predichas"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Datos Detallados</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Día de la Semana</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Ventas Predichas</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{pred.formattedDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{pred.dayOfWeek}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-green-600">
                      {pred.sales.toFixed(2)} unidades
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Info */}
        {modelInfo && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 border border-indigo-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              Información del Modelo de IA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-600 font-medium">Estado</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {modelInfo.trained ? '✅ Entrenado' : '❌ No entrenado'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-600 font-medium">Período de Predicción</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{modelInfo.prediction_period}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-600 font-medium">Fecha Inicio</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {format(parseISO(modelInfo.start_date), 'dd/MM/yyyy', { locale: es })}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-600 font-medium">Fecha Fin</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {format(parseISO(modelInfo.end_date), 'dd/MM/yyyy', { locale: es })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesPredictions;
