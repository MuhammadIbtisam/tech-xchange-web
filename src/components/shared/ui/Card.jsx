import React from 'react';
import { Card as AntCard } from 'antd';

const Card = ({ 
  children, 
  variant = 'default',
  className = '',
  ...props 
}) => {
  const baseClasses = 'shadow-lg border-0 transition-all duration-200';
  
  const variants = {
    default: 'bg-white',
    elevated: 'bg-white shadow-xl hover:shadow-2xl',
    outlined: 'bg-white border-2 border-gray-200 hover:border-blue-300'
  };
  
  // Responsive sizing and spacing
  const responsiveClasses = 'w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl mx-2 sm:mx-4 lg:mx-6';
  
  const classes = `${baseClasses} ${variants[variant]} ${responsiveClasses} ${className}`;
  
  return (
    <AntCard 
      className={classes}
      {...props}
    >
      {children}
    </AntCard>
  );
};

export default Card;