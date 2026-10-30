import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadCurrentUser } from './store/slices/authSlice';

// Components
import Navbar from './components/common/Navbar';
import VerificationBanner from './components/common/VerificationBanner';

// Pages
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ComparePage from './pages/ComparePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import RFQNegotiationPage from './pages/RFQNegotiationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Role-Specific Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import VerificationQueuePage from './pages/admin/VerificationQueuePage';
import CategoryManagerPage from './pages/admin/CategoryManagerPage';

import SupplierDashboard from './pages/supplier/SupplierDashboard';
import ProductBuilderPage from './pages/supplier/ProductBuilderPage';

import BuyerDashboard from './pages/buyer/BuyerDashboard';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(loadCurrentUser());
    }
  }, [dispatch, token]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <VerificationBanner />

        <div className="flex-1">
          <Routes>
            {/* Public Catalog & Browsing */}
            <Route path="/" element={<CatalogPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/cart" element={<CartPage />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Buyer / Checkout */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={['buyer', 'superadmin', 'supplier']}>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rfqs"
              element={
                <ProtectedRoute>
                  <RFQNegotiationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rfq/:id"
              element={
                <ProtectedRoute>
                  <RFQNegotiationPage />
                </ProtectedRoute>
              }
            />

            {/* Super Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/verification-queue"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <VerificationQueuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <CategoryManagerPage />
                </ProtectedRoute>
              }
            />

            {/* Supplier Routes */}
            <Route
              path="/supplier"
              element={
                <ProtectedRoute allowedRoles={['supplier', 'superadmin']}>
                  <SupplierDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supplier/product-builder"
              element={
                <ProtectedRoute allowedRoles={['supplier', 'superadmin']}>
                  <ProductBuilderPage />
                </ProtectedRoute>
              }
            />

            {/* Buyer Dashboard */}
            <Route
              path="/buyer"
              element={
                <ProtectedRoute allowedRoles={['buyer', 'superadmin']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Global Footer */}
        <footer className="bg-slate-900 text-slate-400 py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-200">
                MerchHive B2B Wholesale Trading Platform
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Connecting Verified Suppliers with Businesses for Seamless Bulk Trading.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <span>GST & PAN Verified Trading</span>
              <span>•</span>
              <span>Net-30 Commercial Credit</span>
              <span>•</span>
              <span>Automated Tax Invoicing</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
