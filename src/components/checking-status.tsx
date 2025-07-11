import React, { memo } from 'react';

interface CheckingStatusProps {
  isChecking: boolean;
}

const CheckingStatus = memo(({ isChecking }: CheckingStatusProps) => {
  if (!isChecking) {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20 transition-opacity duration-300 animate-in fade-in">
      <div className="bg-gray-800/90 backdrop-blur-sm border border-yellow-400/30 rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-yellow-200 text-xl font-semibold drop-shadow-md">
          Checking...
        </span>
      </div>
    </div>
  );
});

CheckingStatus.displayName = 'CheckingStatus';

export default CheckingStatus;

