// ============ src/components/common/Alert.jsx ============
import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  const types = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: FiCheckCircle,
      iconColor: 'text-green-500',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: FiAlertCircle,
      iconColor: 'text-red-500',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: FiAlertTriangle,
      iconColor: 'text-yellow-500',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: FiInfo,
      iconColor: 'text-blue-500',
    },
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} ${config.border} border rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-start">
        <Icon className={`h-5 w-5 ${config.iconColor} mt-0.5 mr-3`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${config.text}`}>{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className={`ml-3 ${config.iconColor} hover:opacity-75`}>
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;



