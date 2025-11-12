import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService, categoryService, recommendationService } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import ProductReviews from '../../components/products/ProductReviews';
import { 
  ShoppingCart, 
  ArrowLeft, 
  Package, 
  Tag, 
  Calendar,
  Minus,
  Plus,
  Star,
  Check,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const { addToCart, getItemQuantity } = useCart();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await productService.getProduct(id);
      setProduct(productData);

      // Cargar información de la categoría
      if (productData.category) {
        const categoryData = await categoryService.getCategory(productData.category);
        setCategory(categoryData);
      }

      // Cargar recomendaciones de ML
      loadRecommendations(id);

      setError(null);
    } catch (err) {
      setError('Producto no encontrado');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async (productId) => {
    try {
      setLoadingRecommendations(true);
      const recommendedProducts = await recommendationService.getRecommendations(productId);
      setRecommendations(recommendedProducts);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      // No mostrar error, las recomendaciones son opcionales
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || quantity <= 0) return;

    setAddingToCart(true);
    try {
      // Agregar la cantidad especificada al carrito
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      
      // Mostrar mensaje de éxito (opcional - podrías usar un toast aquí)
      setTimeout(() => setAddingToCart(false), 500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
          <p className="text-gray-600 mb-4">El producto que buscas no existe o ha sido eliminado.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Ver todos los productos
          </button>
        </div>
      </div>
    );
  }

  const isInStock = product.stock > 0;
  const currentCartQuantity = getItemQuantity(product.id);
  const maxQuantity = Math.min(product.stock - currentCartQuantity, product.stock);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navegación */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Imagen del producto */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<svg class="h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                }}
              />
            ) : (
              <Package className="h-24 w-24 text-gray-400" />
            )}
          </div>
          
          {/* Thumbnails removidos temporalmente ya que solo hay una imagen */}
        </div>

        {/* Información del producto */}
        <div className="space-y-6">
          {/* Categoría */}
          {category && (
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <Link
                to={`/products?category=${category.id}`}
                className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {category.name}
              </Link>
            </div>
          )}

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Precio */}
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold text-indigo-600">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            <span className="text-lg text-gray-500">USD</span>
          </div>

          {/* Estado del stock */}
          <div className="flex items-center space-x-2">
            {isInStock ? (
              <>
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-green-600 font-medium">
                  En stock ({product.stock} disponibles)
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-600 font-medium">Agotado</span>
              </>
            )}
          </div>

          {/* Descripción */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Selector de cantidad y botón de agregar al carrito */}
          {isInStock && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <span className="text-xl font-semibold text-gray-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= maxQuantity}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                {currentCartQuantity > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Ya tienes {currentCartQuantity} en tu carrito
                  </p>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart || quantity <= 0 || quantity > maxQuantity}
                className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Agregando...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    <span>
                      Agregar al carrito - ${(parseFloat(product.price) * quantity).toFixed(2)}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Información adicional */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información del producto</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  Agregado: {formatDate(product.created_at)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  ID: #{product.id}
                </span>
              </div>
              
              {category && (
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    Categoría: {category.name}
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  Estado: {product.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          {/* Enlace a productos relacionados */}
          {category && (
            <div className="border-t pt-6">
              <Link
                to={`/products?category=${category.id}`}
                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Ver más productos en {category.name} →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recomendaciones de ML */}
      {recommendations.length > 0 && (
        <div className="mt-12 border-t pt-12">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Productos Recomendados para Ti
            </h2>
          </div>
          <p className="text-gray-600 mb-6">
            Basado en inteligencia artificial y comportamiento de compra
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map((recProduct) => (
              <RecommendedProductCard key={recProduct.id} product={recProduct} />
            ))}
          </div>
        </div>
      )}

      {loadingRecommendations && (
        <div className="mt-12 border-t pt-12">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mr-3" />
            <span className="text-gray-600">Cargando recomendaciones...</span>
          </div>
        </div>
      )}

      {/* Componente de Reseñas */}
      <ProductReviews productId={id} />
    </div>
  );
};

// Componente de tarjeta de producto recomendado
const RecommendedProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div 
      onClick={() => navigate(`/products/${product.id}`)}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
    >
      <div className="aspect-square bg-gray-200 flex items-center justify-center">
        <Package className="h-12 w-12 text-gray-400" />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-600">
            ${parseFloat(product.price).toFixed(2)}
          </span>
          
          {product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
              title="Agregar al carrito"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          ) : (
            <span className="text-xs text-red-600 font-medium">Agotado</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;