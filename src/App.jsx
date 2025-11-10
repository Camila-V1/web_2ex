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
import Categories from './pages/Categories';
import Cart from './pages/cart/Cart';
import Checkout from './pages/cart/Checkout';
import PaymentSuccess from './pages/cart/PaymentSuccess';
import PaymentCancelled from './pages/cart/PaymentCancelled';
import TestPage from './pages/TestPage';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';

// Returns Pages
import ReturnRequest from './pages/returns/ReturnRequest';
import MyReturns from './pages/returns/MyReturns';
import ReturnDetail from './pages/returns/ReturnDetail';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AIReportGenerator from './pages/admin/AIReportGenerator';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAudit from './pages/admin/AdminAudit';

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
              <Route path="/categories" element={<Categories />} />
              
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
                    <MyOrders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas de devoluciones (protegidas para usuarios autenticados) */}
              <Route 
                path="/returns/new" 
                element={
                  <ProtectedRoute>
                    <ReturnRequest />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/returns" 
                element={
                  <ProtectedRoute>
                    <MyReturns />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/returns/:id" 
                element={
                  <ProtectedRoute>
                    <ReturnDetail />
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
                    <AdminProducts />
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/orders" 
                element={
                  <ProtectedAdminRoute>
                    <AdminOrders />
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/categories" 
                element={
                  <ProtectedAdminRoute>
                    <AdminCategories />
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
              <Route 
                path="/admin/audit" 
                element={
                  <ProtectedAdminRoute>
                    <AdminAudit />
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
