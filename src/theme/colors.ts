export const colors = {
  // Primary Colors
  primary: {
    green: '#4CAF50',     // Growth, progress, wellness
    blue: '#2196F3',      // Trust, stability, focus
  },
  
  // Secondary Colors
  secondary: {
    orange: '#FF9800',    // Energy, enthusiasm, achievement
    purple: '#9C27B0',    // Creativity, mindfulness, transformation
  },
  
  // Neutral Base
  neutral: {
    white: '#FAFAFA',     // Clean, spacious feel
    darkGray: '#424242',  // Readable text, professional contrast
    lightGray: '#E0E0E0', // Borders, dividers
    mediumGray: '#666666', // Secondary text
  },
  
  // Semantic Colors (based on primary/secondary palette)
  success: '#4CAF50',
  info: '#2196F3',
  warning: '#FF9800',
  error: '#F44336',
  
  // Common UI States
  background: '#FAFAFA',
  surface: '#FFFFFF',
  text: {
    primary: '#424242',
    secondary: '#666666',
    inverse: '#FFFFFF',
  },
  border: '#E0E0E0',
  
  // Level System Colors (already aligned with our palette)
  levels: {
    foundation: '#4CAF50',  // Green
    building: '#2196F3',    // Blue
    power: '#FF9800',       // Orange
    mastery: '#9C27B0',     // Purple
  }
} as const;

export type Colors = typeof colors;