import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import API from './services/api';

// Pages
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import BlogsPage from './pages/BlogsPage';
import BlogDetailPage from './pages/BlogDetailPage';
import TrainingPage from './pages/TrainingPage';
import PricingPage from './pages/PricingPage';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProfileModal from './components/ProfileModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function AppContent() {
  const { user, loading } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const location = useLocation();

  // Load categories globally for Navbar mega menu
  useEffect(() => {
    API.get('/materials/categories')
      .then(res => {
        if (res.data.success) {
          setCategories(res.data.data);
        }
      })
      .catch(err => console.error('Error loading navbar categories:', err));
  }, []);

  // Protected route wrapper for admins
  const AdminRoute = ({ children }) => {
    if (loading) return (
      <div className="min-h-screen flex items-center justify-center text-orange-500">
        <span className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></span>
      </div>
    );
    
    if (!user || (user.role !== 'SuperAdmin' && user.role !== 'SubAdmin')) {
      return <Navigate to="/admin/login" replace />;
    }
    
    return children;
  };

  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdminPath) {
    return (
      <div className="min-h-screen">
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          {/* Fallback for invalid admin sub-paths */}
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Global Navigation */}
      <Navbar 
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        categories={categories} 
      />

      {/* Main Content Area */}
      <main className="flex-grow w-full flex flex-col">
        <Routes>
          <Route 
            path="/" 
            element={<Home />} 
          />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/:slug" element={<BlogDetailPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer categories={categories} />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
