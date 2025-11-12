import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingBag, Star, Shield, Truck, Users, TrendingUp } from 'lucide-react';
import RecommendedCarousel from '../components/products/RecommendedCarousel';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: ShoppingBag,
      title: 'Amplio Catálogo',
      description: 'Miles de productos de las mejores marcas disponibles para ti.',
    },
    {
      icon: Shield,
      title: 'Pagos Seguros',
      description: 'Transacciones protegidas con la tecnología más avanzada.',
    },
    {
      icon: Truck,
      title: 'Envío Rápido',
      description: 'Entrega en tiempo récord directamente a tu puerta.',
    },
    {
      icon: Star,
      title: 'Calidad Garantizada',
      description: 'Solo productos de la más alta calidad y garantía.',
    },
  ];

  const stats = [
    { icon: Users, value: '50K+', label: 'Clientes Satisfechos' },
    { icon: ShoppingBag, value: '100K+', label: 'Productos Vendidos' },
    { icon: TrendingUp, value: '99%', label: 'Satisfacción del Cliente' },
    { icon: Shield, value: '24/7', label: 'Soporte Disponible' },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Carousel de recomendaciones - Solo para usuarios autenticados */}
      {isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RecommendedCarousel />
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {isAuthenticated && (
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  ¡Bienvenido, {user?.username}!
                </span>
              </div>
            )}
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bienvenido a
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                SmartSales365
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Tu plataforma de e-commerce inteligente. Descubre productos increíbles 
              con la mejor experiencia de compra online.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Explorar Productos
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-all duration-200"
                >
                  Crear Cuenta
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="absolute top-1/2 -left-8 w-32 h-32 bg-yellow-400 opacity-10 rounded-full"></div>
          <div className="absolute bottom-8 right-1/4 w-16 h-16 bg-orange-500 opacity-10 rounded-full"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Por qué elegir SmartSales365?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ofrecemos la mejor experiencia de compra con características únicas 
            diseñadas para tu comodidad y seguridad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Números que nos respaldan
            </h2>
            <p className="text-xl text-gray-300">
              La confianza de nuestros clientes es nuestro mayor logro
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl text-white p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de clientes satisfechos y descubre una nueva forma de comprar online.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg"
            >
              Ver Productos
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-all duration-200"
              >
                Registrarse Gratis
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;