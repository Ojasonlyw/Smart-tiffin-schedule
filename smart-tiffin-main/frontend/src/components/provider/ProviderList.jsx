// ============ src/components/provider/ProviderList.jsx ============
import React from 'react';
import ProviderCard from './ProviderCard';
import Loader from '../common/Loader';

const ProviderList = ({ providers, loading, onFavoriteToggle }) => {
  if (loading) {
    return <Loader />;
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No providers found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {providers.map((provider) => (
        <ProviderCard
          key={provider._id}
          provider={provider}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </div>
  );
};

export default ProviderList;