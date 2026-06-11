// ============ src/components/common/Skeleton.jsx ============
import React from 'react';

export const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

// Card Skeleton for Provider Cards
export const ProviderCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <Skeleton className="w-full h-48 mb-4" />
    <Skeleton className="w-3/4 h-6 mb-2" variant="text" />
    <Skeleton className="w-1/2 h-4 mb-3" variant="text" />
    <div className="flex items-center mb-3">
      <Skeleton className="w-20 h-4 mr-2" variant="text" />
      <Skeleton className="w-24 h-4" variant="text" />
    </div>
    <div className="flex gap-2 mb-3">
      <Skeleton className="w-20 h-6" />
      <Skeleton className="w-24 h-6" />
      <Skeleton className="w-16 h-6" />
    </div>
    <Skeleton className="w-full h-10" />
  </div>
);

// List Skeleton
export const ListSkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start space-x-4">
          <Skeleton className="w-16 h-16" variant="circular" />
          <div className="flex-1">
            <Skeleton className="w-3/4 h-5 mb-2" variant="text" />
            <Skeleton className="w-full h-4 mb-2" variant="text" />
            <Skeleton className="w-1/2 h-4" variant="text" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="p-4 border-b bg-gray-50">
      <div className="flex space-x-4">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="w-1/4 h-4" variant="text" />
        ))}
      </div>
    </div>
    {[...Array(rows)].map((_, rowIndex) => (
      <div key={rowIndex} className="p-4 border-b">
        <div className="flex space-x-4">
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton key={colIndex} className="w-1/4 h-4" variant="text" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Stats Card Skeleton
export const StatsCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <Skeleton className="w-24 h-4 mb-2" variant="text" />
        <Skeleton className="w-32 h-8" variant="text" />
      </div>
      <Skeleton className="w-12 h-12" variant="circular" />
    </div>
  </div>
);

export default Skeleton;

