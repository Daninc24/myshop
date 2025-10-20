// Responsive utility functions

export const getResponsiveClasses = (baseClasses, responsiveClasses = {}) => {
  const classes = [baseClasses];
  
  Object.entries(responsiveClasses).forEach(([breakpoint, className]) => {
    if (className) {
      classes.push(`${breakpoint}:${className}`);
    }
  });
  
  return classes.join(' ');
};

export const getResponsiveValue = (values, screenSize) => {
  // Values should be an object like { xs: 'value1', sm: 'value2', lg: 'value3' }
  const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(screenSize);
  
  // Find the closest defined value for current or smaller breakpoint
  for (let i = currentIndex; i >= 0; i--) {
    const breakpoint = breakpointOrder[i];
    if (values[breakpoint] !== undefined) {
      return values[breakpoint];
    }
  }
  
  // Fallback to the smallest defined value
  for (const breakpoint of breakpointOrder) {
    if (values[breakpoint] !== undefined) {
      return values[breakpoint];
    }
  }
  
  return null;
};

export const getGridCols = (screenSize) => {
  const gridMapping = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 4,
    '2xl': 5
  };
  
  return gridMapping[screenSize] || 4;
};

export const getProductCardVariant = (screenSize) => {
  return screenSize === 'xs' || screenSize === 'sm' ? 'compact' : 'default';
};

export const getFooterLayout = (screenSize) => {
  if (screenSize === 'xs') {
    return {
      columns: 1,
      gap: 'gap-2',
      padding: 'py-4 px-3',
      textSize: 'text-xs',
      titleSize: 'text-sm'
    };
  } else if (screenSize === 'sm') {
    return {
      columns: 2,
      gap: 'gap-4',
      padding: 'py-6 px-4',
      textSize: 'text-sm',
      titleSize: 'text-base'
    };
  } else {
    return {
      columns: 4,
      gap: 'gap-6',
      padding: 'py-8 px-6',
      textSize: 'text-sm',
      titleSize: 'text-lg',
      maxHeight: 'max-h-96'
    };
  }
};

export const getCompactSpacing = (screenSize) => {
  const spacingMap = {
    xs: {
      padding: 'p-2',
      margin: 'm-1',
      gap: 'gap-1'
    },
    sm: {
      padding: 'p-3',
      margin: 'm-2',
      gap: 'gap-2'
    },
    md: {
      padding: 'p-4',
      margin: 'm-3',
      gap: 'gap-3'
    },
    lg: {
      padding: 'p-6',
      margin: 'm-4',
      gap: 'gap-4'
    },
    xl: {
      padding: 'p-8',
      margin: 'm-6',
      gap: 'gap-6'
    },
    '2xl': {
      padding: 'p-10',
      margin: 'm-8',
      gap: 'gap-8'
    }
  };
  
  return spacingMap[screenSize] || spacingMap.lg;
};