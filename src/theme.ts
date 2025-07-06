export const theme = {
  colors: {
    primary: {
      green: '#10B981',
      blue: '#007AFF',
    },
    secondary: {
      orange: '#FF6B6B',
      purple: '#8B5CF6',
    },
    neutral: {
      white: '#FFFFFF',
      darkGray: '#333333',
      lightGray: '#F8F9FA',
      mediumGray: '#E0E0E0',
    },
    success: '#10B981',
    info: '#3B82F6',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: {
      primary: '#333333',
      secondary: '#666666',
      inverse: '#FFFFFF',
    },
    border: '#E0E0E0',
    // Level System Colors
    levels: {
      foundation: '#10B981',  // Green
      building: '#007AFF',    // Blue
      power: '#FF6B6B',       // Orange
      mastery: '#8B5CF6',     // Purple
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      title: 28,
      heading: 32,
    },
    weights: {
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6.27,
      elevation: 10,
    },
  },
};

export type Theme = typeof theme;