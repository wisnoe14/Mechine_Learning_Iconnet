import React from 'react';

interface StatusBadgeProps {
  children: React.ReactNode;
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'muted';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ children, variant, className = '' }) => {
  const variants: Record<string, string> = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-400 text-black',
    muted: 'bg-muted text-muted-foreground'
  };

  return (
    <span
      className={`
        px-3 py-1.5 text-xs font-semibold rounded-full
        transition-all duration-300 hover:scale-105
        ${variants[variant] || variants.primary} ${className}
      `}
    >
      {children}
    </span>
  );
};

export default StatusBadge;