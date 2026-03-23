
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <div
          key={idx}
          className={`h-2 rounded-full transition-all duration-300 ${
            idx < currentStep 
              ? 'w-8 bg-blue-600' 
              : idx === currentStep 
                ? 'w-12 bg-blue-500 shadow-sm' 
                : 'w-4 bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
};
