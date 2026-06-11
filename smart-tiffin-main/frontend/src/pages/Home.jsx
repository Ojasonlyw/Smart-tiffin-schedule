// ============ src/pages/Home.jsx ============
import React from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiCalendar, FiCreditCard, FiTrendingUp } from 'react-icons/fi';
import Button from '../components/common/Button';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Your Daily Meals,
              <span className="text-primary-600"> Simplified</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover, plan, and subscribe to the best tiffin services in your area. Fresh, homemade meals delivered to your doorstep.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/explore">
                <Button size="lg">Explore Providers</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Simple steps to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                <FiCreditCard className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Subscribe</h3>
              <p className="text-gray-600">Choose a plan and make secure payment</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                <FiTrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy</h3>
              <p className="text-gray-600">Get fresh meals delivered daily</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary-600">500+</p>
              <p className="text-gray-600 mt-2">Verified Providers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary-600">10,000+</p>
              <p className="text-gray-600 mt-2">Happy Customers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary-600">50,000+</p>
              <p className="text-gray-600 mt-2">Meals Delivered</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of satisfied customers enjoying delicious homemade meals
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

