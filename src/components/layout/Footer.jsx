import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">SmartSales365</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4 max-w-md">
              Tu plataforma de e-commerce de confianza. Ofrecemos productos de calidad 
              con la mejor experiencia de compra online. Tecnología avanzada para tus 
              necesidades de venta.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-indigo-400 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-indigo-400 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-indigo-400 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Productos
                </Link>
              </li>
              <li>
                <Link 
                  to="/categories" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Categorías
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Acerca de
                </Link>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 text-sm">info@smartsales365.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 text-sm">+591 123-456-789</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  Santa Cruz, Bolivia<br />
                  Zona Empresarial
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisora */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 SmartSales365. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Privacidad
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Términos
              </Link>
              <Link 
                to="/support" 
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Soporte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;