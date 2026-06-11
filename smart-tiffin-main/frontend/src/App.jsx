// ============ src/App.jsx - UPDATED WITH CHAT ============
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Chat Components
import ChatNotification from './components/chat/ChatNotification';

// Pages
import Home from './pages/Home';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Profile from './pages/Profile';
import ExplorePage from './pages/ExplorePage';
import ProviderDetailsPage from './pages/ProviderDetailsPage';
import MealPlannerPage from './pages/MealPlannerPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import CreateSubscriptionPage from './pages/CreateSubscriptionPage';
import ChatPage from './pages/ChatPage';
import FavoritesPage from './pages/FavoritesPage';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateProviderPage from './pages/CreateProviderPage';
import MenuManagementPage from './pages/MenuManagementPage';
import PricingManagementPage from './pages/PricingManagementPage';

// Socket Service
import socketService from './services/socketService';

function App() {
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect(token);
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);

  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/providers/:id" element={<ProviderDetailsPage />} />

          {/* Protected Routes - All authenticated users */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - User only */}
          <Route
            path="/meal-planner"
            element={
              <ProtectedRoute roles={['user']}>
                <MealPlannerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute roles={['user']}>
                <SubscriptionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions/new"
            element={
              <ProtectedRoute roles={['user']}>
                <CreateSubscriptionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute roles={['user']}>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Provider only */}
          <Route
            path="/provider-dashboard"
            element={
              <ProtectedRoute roles={['provider']}>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/create"
            element={
              <ProtectedRoute roles={['provider']}>
                <CreateProviderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/menu/:id"
            element={
              <ProtectedRoute roles={['provider']}>
                <MenuManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/pricing/:id"
            element={
              <ProtectedRoute roles={['provider']}>
                <PricingManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin only */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>

      {/* Global Chat Notification */}
      {isAuthenticated && <ChatNotification />}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

const NotFound = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <a href="/" className="text-primary-600 hover:text-primary-700 font-medium">
        Go back home
      </a>
    </div>
  </div>
);

export default App;