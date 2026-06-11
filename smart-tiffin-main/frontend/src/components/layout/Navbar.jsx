// ============ src/components/layout/Navbar.jsx - UPDATED ============
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiMenu, FiBell, FiUser, FiLogOut, FiSettings, FiMessageSquare } from 'react-icons/fi';
import { logout } from '../../redux/slices/authSlice';
import { getInitials, generateAvatarColor } from '../../utils/helpers';
import UnreadChatBadge from '../chat/UnreadChatBadge';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">ST</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Smart Tiffin
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/explore" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Explore
            </Link>
            {isAuthenticated && user?.role === 'user' && (
              <>
                <Link to="/meal-planner" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  Meal Planner
                </Link>
                <Link to="/subscriptions" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  Subscriptions
                </Link>
                <Link to="/favorites" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  Favorites
                </Link>
              </>
            )}
            {isAuthenticated && user?.role === 'provider' && (
              <Link to="/provider-dashboard" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Dashboard
              </Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin-dashboard" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Chat Icon with Badge */}
                <Link to="/chat" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <FiMessageSquare className="h-6 w-6" />
                  <UnreadChatBadge />
                </Link>

                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <FiBell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className={`h-10 w-10 ${generateAvatarColor(user?.name)} rounded-full flex items-center justify-center text-white font-semibold`}>
                      {getInitials(user?.name)}
                    </div>
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
                        <div className="px-4 py-2 border-b">
                          <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FiUser className="mr-2" />
                          Profile
                        </Link>
                        <Link
                          to="/chat"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FiMessageSquare className="mr-2" />
                          Messages
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FiSettings className="mr-2" />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <FiLogOut className="mr-2" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <button className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <button className="md:hidden p-2 text-gray-600">
              <FiMenu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;