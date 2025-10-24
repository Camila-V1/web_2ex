import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProductCatalog from './pages/products/ProductCatalog';
import ProductDetail from './pages/products/ProductDetail';
import Cart from './pages/cart/Cart';
import Checkout from './pages/cart/Checkout';
import PaymentSuccess from './pages/cart/PaymentSuccess';
import PaymentCancelled from './pages/cart/PaymentCancelled';
import TestPage from './pages/TestPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AIReportGenerator from './pages/admin/AIReportGenerator';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/test" element={<TestPage />} />
              
              {/* Rutas de productos (públicas pero con funcionalidad adicional para autenticados) */}
              <Route path="/products" element={<ProductCatalog />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/categories" element={<div className="p-8 text-center">Categorías - En construcción</div>} />
              
              {/* Carrito (público pero checkout requiere autenticación) */}
              <Route path="/cart" element={<Cart />} />
              
              {/* Rutas protegidas para usuarios autenticados */}
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <div className="p-8 text-center">Mis Pedidos - En construcción</div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <div className="p-8 text-center">Mi Perfil - En construcción</div>
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas de pago (públicas para que Stripe pueda redirigir) */}
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-cancelled" element={<PaymentCancelled />} />
              
              {/* Rutas protegidas para administradores */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/products" 
                element={
                  <ProtectedAdminRoute>
                    <div className="p-8 text-center">Gestión de Productos - En construcción</div>
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/orders" 
                element={
                  <ProtectedAdminRoute>
                    <div className="p-8 text-center">Gestión de Órdenes - En construcción</div>
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedAdminRoute>
                    <AdminUsers />
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/reports" 
                element={
                  <ProtectedAdminRoute>
                    <AdminReports />
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/ai-reports" 
                element={
                  <ProtectedAdminRoute>
                    <AIReportGenerator />
                  </ProtectedAdminRoute>
                } 
              />
              
              {/* Ruta 404 */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Página no encontrada</p>
                    <a href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                      Volver al inicio
                    </a>
                  </div>
                </div>
              } />
            </Routes>
          </Layout>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
