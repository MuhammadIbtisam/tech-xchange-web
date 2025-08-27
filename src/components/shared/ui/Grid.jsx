import React from 'react';

const Grid = ({ 
  children, 
  cols = 1,
  gap = 'default',
  className = '',
  ...props 
}) => {
  const gapClasses = {
    small: 'gap-2 sm:gap-3 lg:gap-4',
    default: 'gap-3 sm:gap-4 lg:gap-6',
    large: 'gap-4 sm:gap-6 lg:gap-8'
  };
  
  // Responsive grid columns
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };
  
  const classes = `grid ${gridCols[cols]} ${gapClasses[gap]} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Grid;