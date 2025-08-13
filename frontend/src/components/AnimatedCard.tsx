import React from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  glow = false 
}) => {
  return (
    <div className={`
      glass-card rounded-2xl p-6
      ${hover ? 'card-interactive' : ''}
      ${glow ? 'pulse-glow' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default AnimatedCard;