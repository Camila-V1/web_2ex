import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService, categoryService, nlpService } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { 
  ShoppingCart, 
  Star, 
  Filter, 
  Grid, 
  List, 
  Search,
  Package,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';

const ProductCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  const { addToCart, getItemQuantity } = useCart();

  useEffect(() => {
    loadData();
  }, []);

  // Leer categoría desde URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // Validar que la categoría existe
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const categoryExists = categories.find(cat => cat.id.toString() === selectedCategory.toString());
      if (!categoryExists) {
        console.warn(`Categoría ${selectedCategory} no encontrada`);
        setError(`La categoría seleccionada no existe`);
        setSelectedCategory('');
        setSearchParams({});
      }
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, priceRange]);

  // Efecto para obtener sugerencias de autocompletado
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length >= 2) {
        setLoadingSuggestions(true);
        try {
          const suggestionsData = await nlpService.getCartSuggestions(searchTerm);
          setSuggestions(suggestionsData);
          setShowSuggestions(true);
        } catch (err) {
          console.error('Error fetching suggestions:', err);
          setSuggestions([]);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories()
      ]);
      
      // Log para debug
      console.log('Productos cargados:', productsData);
      console.log('Categorías cargadas:', categoriesData);
      
      // Validar que los productos tienen estructura correcta
      const validatedProducts = productsData.map(product => ({
        ...product,
        category: product.category || null // Asegurar que category nunca sea undefined
      }));
      
      setProducts(validatedProducts);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      setError('Error al cargar los productos. Por favor, intenta nuevamente.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoría
    if (selectedCategory) {
      filtered = filtered.filter(product => {
        // Convertir ambos a string para comparación
        const productCategoryId = product.category?.id || product.category;
        // Validar que productCategoryId existe antes de hacer toString()
        if (!productCategoryId) return false;
        return productCategoryId.toString() === selectedCategory.toString();
      });
    }

    // Filtro por rango de precios
    if (priceRange.min) {
      filtered = filtered.filter(product => 
        parseFloat(product.price) >= parseFloat(priceRange.min)
      );
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => 
        parseFloat(product.price) <= parseFloat(priceRange.max)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (product) => {
    setSearchTerm(product.name);
    setShowSuggestions(false);
  };

  const getCategoryName = (categoryId) => {
    // Manejar si categoryId es undefined, null, un objeto o un ID
    if (!categoryId) return 'Sin categoría';
    const id = categoryId?.id || categoryId;
    const category = categories.find(cat => cat.id === id);
    return category ? category.name : 'Sin categoría';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar productos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Productos</h1>
        <p className="text-gray-600">Descubre nuestra amplia selección de productos</p>
      </div>

      {/* Alerta de error de categoría */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-yellow-400 hover:text-yellow-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda con autocompletado */}
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos con IA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {searchTerm && (
                <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-500 animate-pulse" />
              )}
            </div>
            
            {/* Dropdown de sugerencias */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
              >
                <div className="p-2">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <Sparkles className="h-3 w-3" />
                    Sugerencias de IA
                  </div>
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSuggestionClick(product)}
                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                        <Package className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          ${parseFloat(product.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {loadingSuggestions && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
                  <span className="text-sm text-gray-600">Buscando...</span>
                </div>
              </div>
            )}
          </div>

          {/* Filtro por categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Rango de precios */}
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Precio mín"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="number"
              placeholder="Precio máx"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Toggle de vista */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="mb-6">
        <p className="text-gray-600">
          Mostrando {filteredProducts.length} de {products.length} productos
        </p>
      </div>

      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
          <p className="text-gray-600">Intenta ajustar los filtros para ver más resultados.</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              categoryName={getCategoryName(product.category)}
              onAddToCart={handleAddToCart}
              cartQuantity={getItemQuantity(product.id)}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Componente ProductCard
const ProductCard = ({ product, categoryName, onAddToCart, cartQuantity, viewMode }) => {
  const isInStock = product.stock > 0;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
        <div className="flex items-center space-x-6">
          {/* Imagen del producto */}
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="h-8 w-8 text-gray-400" />
          </div>

          {/* Información del producto */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  <Link 
                    to={`/products/${product.id}`}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {product.name}
                  </Link>
                </h3>
                <p className="text-sm text-gray-600 mb-2">{categoryName}</p>
                <p className="text-gray-700 text-sm line-clamp-2">{product.description}</p>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600 mb-2">
                  ${parseFloat(product.price).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Stock: {product.stock}
                </p>
                
                <button
                  onClick={() => onAddToCart(product)}
                  disabled={!isInStock}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isInStock
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {cartQuantity > 0 ? `En carrito (${cartQuantity})` : 'Agregar al carrito'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Imagen del producto */}
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        <Package className="h-12 w-12 text-gray-400" />
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {categoryName}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          <Link 
            to={`/products/${product.id}`}
            className="hover:text-indigo-600 transition-colors"
          >
            {product.name}
          </Link>
        </h3>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-indigo-600">
            ${parseFloat(product.price).toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">
            Stock: {product.stock}
          </span>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={!isInStock}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
            isInStock
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>
            {cartQuantity > 0 ? `En carrito (${cartQuantity})` : 'Agregar al carrito'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProductCatalog;