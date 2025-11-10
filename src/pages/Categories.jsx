import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoryService, productService } from '../services/api';
import { Tag, Grid, Package, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await categoryService.getCategories();
      setCategories(categoriesData);

      // Cargar productos para contar por categoría
      const productsData = await productService.getProducts();
      
      // Calcular estadísticas por categoría
      const stats = {};
      categoriesData.forEach(cat => {
        const categoryProducts = productsData.filter(p => {
          const productCategoryId = p.category?.id || p.category;
          return productCategoryId === cat.id;
        });
        stats[cat.id] = {
          count: categoryProducts.length,
          products: categoryProducts
        };
      });
      
      setCategoryStats(stats);
      setError(null);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando categorías...</p>
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
            onClick={loadCategories}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
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
        <div className="flex items-center gap-3 mb-3">
          <Grid className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Categorías de Productos</h1>
        </div>
        <p className="text-gray-600">
          Explora nuestras categorías y encuentra lo que buscas
        </p>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
          <Tag className="h-8 w-8 mb-2" />
          <p className="text-2xl font-bold">{categories.length}</p>
          <p className="text-indigo-100">Categorías Disponibles</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
          <Package className="h-8 w-8 mb-2" />
          <p className="text-2xl font-bold">
            {Object.values(categoryStats).reduce((sum, stat) => sum + stat.count, 0)}
          </p>
          <p className="text-green-100">Productos Totales</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg p-6 text-white">
          <Grid className="h-8 w-8 mb-2" />
          <p className="text-2xl font-bold">
            {Object.values(categoryStats).filter(stat => stat.count > 0).length}
          </p>
          <p className="text-blue-100">Categorías Activas</p>
        </div>
      </div>

      {/* Grid de Categorías */}
      {categories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay categorías disponibles
          </h3>
          <p className="text-gray-600">
            Las categorías aparecerán aquí cuando se agreguen productos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const stats = categoryStats[category.id] || { count: 0, products: [] };
            
            return (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-indigo-500"
              >
                {/* Imagen/Header de la categoría */}
                <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <Tag className="h-16 w-16 text-indigo-600 group-hover:scale-110 transition-transform" />
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {category.description || 'Sin descripción'}
                      </p>
                    </div>
                  </div>

                  {/* Estadísticas */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {stats.count} {stats.count === 1 ? 'producto' : 'productos'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-indigo-600 font-medium group-hover:gap-3 transition-all">
                      <span className="text-sm">Ver productos</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Preview de productos (primeros 3) */}
                  {stats.products.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                        Productos destacados
                      </p>
                      <div className="space-y-1">
                        {stats.products.slice(0, 3).map((product) => (
                          <div
                            key={product.id}
                            className="text-xs text-gray-600 truncate flex items-center gap-2"
                          >
                            <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                            {product.name}
                          </div>
                        ))}
                        {stats.products.length > 3 && (
                          <p className="text-xs text-indigo-600 font-medium">
                            + {stats.products.length - 3} más
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">¿No encuentras lo que buscas?</h2>
        <p className="mb-6 text-indigo-100">
          Explora todos nuestros productos o usa nuestra búsqueda inteligente
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/products"
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
          >
            Ver Todos los Productos
          </Link>
          <Link
            to="/products"
            className="bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-800 transition-colors border border-indigo-400"
          >
            Buscar con IA
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Categories;
