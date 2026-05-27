
import React from 'react';

const PlaceholderScreen = ({ title, moduleName }) => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[60vh] flex flex-col items-center justify-center text-center animate-fade-in">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <svg 
          className="w-8 h-8 text-blue-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title || moduleName}</h2>
      <p className="text-gray-500 max-w-md">
        This module is currently under development. Detailed features for 
        <span className="font-semibold text-gray-700"> {moduleName} </span> 
        will be implemented soon.
      </p>
    </div>
  );
};

export default PlaceholderScreen;
