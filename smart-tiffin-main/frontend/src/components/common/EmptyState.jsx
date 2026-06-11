// ============ src/components/common/EmptyState.jsx ============
import React from 'react';
import { FiInbox, FiSearch, FiAlertCircle } from 'react-icons/fi';
import Button from './Button';

const EmptyState = ({ 
  icon: Icon = FiInbox,
  title = 'No data found',
  message = 'There is no data to display at the moment.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};

// Predefined Empty States
export const NoProvidersFound = ({ onAction }) => (
  <EmptyState
    icon={FiSearch}
    title="No providers found"
    message="We couldn't find any tiffin providers matching your criteria. Try adjusting your filters."
    actionLabel="Clear Filters"
    onAction={onAction}
  />
);

export const NoSubscriptions = ({ onAction }) => (
  <EmptyState
    icon={FiInbox}
    title="No subscriptions yet"
    message="You haven't subscribed to any tiffin services yet. Explore providers and find your perfect meal plan!"
    actionLabel="Explore Providers"
    onAction={onAction}
  />
);

export const NoMealPlans = ({ onAction }) => (
  <EmptyState
    icon={FiInbox}
    title="No meal plans created"
    message="Start planning your weekly meals to stay organized and eat healthier!"
    actionLabel="Create Meal Plan"
    onAction={onAction}
  />
);

export const NoFavorites = ({ onAction }) => (
  <EmptyState
    icon={FiInbox}
    title="No favorites yet"
    message="Save your favorite tiffin providers for quick access later!"
    actionLabel="Explore Providers"
    onAction={onAction}
  />
);

export const ErrorState = ({ onRetry }) => (
  <EmptyState
    icon={FiAlertCircle}
    title="Something went wrong"
    message="We encountered an error while loading the data. Please try again."
    actionLabel="Retry"
    onAction={onRetry}
  />
);

export default EmptyState;

