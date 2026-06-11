// ============ src/pages/FavoritesPage.jsx ============
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi';
import ProviderList from '../components/provider/ProviderList';
import { ProviderCardSkeleton } from '../components/common/Skeleton';
import { NoFavorites } from '../components/common/EmptyState';
import { toast } from 'react-toastify';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await userApi.getFavorites();
      setFavorites(response.data.favorites);
    } catch (error) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (providerId) => {
    try {
      await userApi.toggleFavorite(providerId);
      setFavorites(favorites.filter((f) => f._id !== providerId));
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Favorites</h1>
        <p className="text-lg text-gray-600">
          Your saved tiffin providers ({favorites.length})
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <ProviderCardSkeleton key={i} />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <ProviderList
          providers={favorites}
          loading={false}
          onFavoriteToggle={handleFavoriteToggle}
        />
      ) : (
        <NoFavorites onAction={() => navigate('/explore')} />
      )}
    </div>
  );
};

export default FavoritesPage;

