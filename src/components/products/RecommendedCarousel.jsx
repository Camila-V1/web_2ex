import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/api';
import { ChevronLeft, ChevronRight, ShoppingCart, Sparkles } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export default function RecommendedCarousel() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchRecommendations();
    
    // Auto-scroll cada 5 segundos
    const interval = setInterval(() => {
      scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      // Obtener productos recomendados (puedes usar un endpoint específico o filtrar)
      const products = await productService.getProducts();
      
      console.log('🔍 [CAROUSEL] Total productos:', products.length);
      console.log('🔍 [CAROUSEL] Primer producto:', products[0]);
      console.log('🔍 [CAROUSEL] image_url del primero:', products[0]?.image_url);
      
      // Simular recomendaciones IA - En producción esto vendría del backend
      // Por ahora, tomar productos aleatorios con stock
      const available = products.filter(p => p.stock > 0 && p.is_active);
      const shuffled = available.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 10); // Top 10 recomendaciones
      
      console.log('🔍 [CAROUSEL] Productos seleccionados:', selected.length);
      console.log('🔍 [CAROUSEL] Imágenes:', selected.map(p => ({ id: p.id, name: p.name, image: p.image_url })));
      
      setRecommendations(selected);
    } catch (error) {
      console.error('Error al cargar recomendaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollNext = () => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const cardWidth = container.querySelector('.product-card')?.offsetWidth || 250;
      const gap = 16; // gap-4 = 16px
      const scrollAmount = cardWidth + gap;
      
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      
      // Calcular índice actual
      const newIndex = Math.min(currentIndex + 1, recommendations.length - 1);
      setCurrentIndex(newIndex);
      
      // Si llegamos al final, volver al inicio
      if (newIndex >= recommendations.length - 3) {
        setTimeout(() => {
          container.scrollTo({ left: 0, behavior: 'smooth' });
          setCurrentIndex(0);
        }, 100);
      }
    }
  };

  const scrollPrev = () => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const cardWidth = container.querySelector('.product-card')?.offsetWidth || 250;
      const gap = 16;
      const scrollAmount = cardWidth + gap;
      
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
          <h2 className="text-2xl font-bold text-white">Recomendado para ti</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-60 h-64 bg-white/20 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl shadow-2xl p-6 mb-8 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 p-2 rounded-lg">
            <Sparkles className="h-6 w-6 text-purple-900" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Recomendado para ti</h2>
            <p className="text-purple-200 text-sm">Seleccionados por IA basado en tus preferencias</p>
          </div>
        </div>
        
        {/* Controles de navegación */}
        <div className="flex gap-2">
          <button
            onClick={scrollPrev}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-all duration-200"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={scrollNext}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-all duration-200"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div 
        ref={carouselRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth relative z-10"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recommendations.map((product) => (
          <div
            key={product.id}
            className="product-card flex-shrink-0 w-60 bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            onClick={() => navigate(`/products/${product.id}`)}
          >
            {/* Imagen */}
            <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 relative overflow-hidden flex items-center justify-center">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-center p-4">
                  <div className="text-4xl mb-2">
                    {product.category_name?.toLowerCase().includes('laptop') ? '💻' :
                     product.category_name?.toLowerCase().includes('phone') || product.name.toLowerCase().includes('iphone') || product.name.toLowerCase().includes('samsung') || product.name.toLowerCase().includes('xiaomi') ? '📱' :
                     product.category_name?.toLowerCase().includes('tv') || product.name.toLowerCase().includes('tv') ? '📺' :
                     product.category_name?.toLowerCase().includes('audio') || product.name.toLowerCase().includes('airpods') || product.name.toLowerCase().includes('auricular') ? '🎧' :
                     product.category_name?.toLowerCase().includes('gaming') || product.name.toLowerCase().includes('playstation') || product.name.toLowerCase().includes('xbox') ? '🎮' :
                     product.category_name?.toLowerCase().includes('hogar') || product.name.toLowerCase().includes('cafetera') || product.name.toLowerCase().includes('aspiradora') ? '🏠' :
                     product.category_name?.toLowerCase().includes('libro') || product.name.toLowerCase().includes('libro') ? '📚' :
                     product.category_name?.toLowerCase().includes('juguete') || product.name.toLowerCase().includes('lego') ? '🧸' :
                     product.category_name?.toLowerCase().includes('deporte') || product.name.toLowerCase().includes('bicicleta') ? '⚽' :
                     product.category_name?.toLowerCase().includes('cámara') || product.name.toLowerCase().includes('canon') || product.name.toLowerCase().includes('nikon') ? '📷' :
                     '📦'}
                  </div>
                  <p className="text-xs text-gray-600 font-medium line-clamp-2">{product.name}</p>
                </div>
              )}
              
              {/* Badge de IA */}
              <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-purple-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                IA
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">
                {product.name}
              </h3>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-bold text-indigo-600">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">
                  Stock: {product.stock}
                </span>
              </div>

              <button
                onClick={(e) => handleAddToCart(e, product)}
                className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Agregar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Indicadores de posición */}
      <div className="flex justify-center gap-2 mt-4 relative z-10">
        {recommendations.slice(0, Math.min(10, recommendations.length)).map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'w-8 bg-yellow-400' 
                : 'w-2 bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* CSS para ocultar scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
