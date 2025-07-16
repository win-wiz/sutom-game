'use client';

import { memo } from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinnerComponent = ({ message = 'Chargement en cours...' }: LoadingSpinnerProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-white text-xl">{message}</div>
      </div>
    </div>
  );
};

export const LoadingSpinner = memo(LoadingSpinnerComponent);