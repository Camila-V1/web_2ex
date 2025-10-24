import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Test de Tailwind CSS
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-blue-600 mb-3">Colores</h3>
            <div className="space-y-2">
              <div className="w-full h-4 bg-red-500 rounded"></div>
              <div className="w-full h-4 bg-green-500 rounded"></div>
              <div className="w-full h-4 bg-blue-500 rounded"></div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-green-600 mb-3">Espaciado</h3>
            <div className="space-y-3">
              <div className="p-2 bg-gray-100 rounded">Padding pequeño</div>
              <div className="p-4 bg-gray-200 rounded">Padding mediano</div>
              <div className="p-6 bg-gray-300 rounded">Padding grande</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-purple-600 mb-3">Botones</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors">
                Botón Azul
              </button>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors">
                Botón Verde
              </button>
              <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors">
                Botón Rojo
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Estado de Tailwind CSS</h2>
          <p className="text-gray-600 mb-4">
            Si puedes ver este diseño con colores, espaciado y estilos correctos, 
            entonces Tailwind CSS está funcionando perfectamente.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">✅ Colores</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">✅ Espaciado</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">✅ Responsive</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">✅ Sombras</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">✅ Transiciones</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;