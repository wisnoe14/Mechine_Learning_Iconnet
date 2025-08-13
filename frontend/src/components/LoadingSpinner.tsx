import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <div className={`spinner ${sizeClasses[size]} border-2 border-primary/30 border-t-primary rounded-full`} />
      {text && (
        <span className="text-muted-foreground font-medium animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
