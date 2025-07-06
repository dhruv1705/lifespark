# Lifespark App - Development Guide

## Design System & Colors

### Color Palette
The app uses a cohesive color scheme designed for life improvement and wellness:

**Primary Colors:**
- Green (`#4CAF50`) - Growth, progress, wellness
- Blue (`#2196F3`) - Trust, stability, focus

**Secondary Colors:**
- Orange (`#FF9800`) - Energy, enthusiasm, achievement  
- Purple (`#9C27B0`) - Creativity, mindfulness, transformation

**Neutral Base:**
- Off-white (`#FAFAFA`) - Clean background
- Dark Gray (`#424242`) - Primary text
- Light Gray (`#E0E0E0`) - Borders, dividers

### Theme Usage
Always import and use the centralized theme:
```typescript
import { theme } from '../theme';

// Use theme colors instead of hardcoded hex values
backgroundColor: theme.colors.primary.green
color: theme.colors.text.primary
```

### Consistency Guidelines
1. **Always use theme variables** - Never hardcode colors, spacing, or typography
2. **Follow semantic naming** - Use `theme.colors.success` instead of direct green references
3. **Maintain visual hierarchy** - Use consistent spacing (`theme.spacing.*`) and typography scales
4. **Level system colors** - Foundation (green), Building (blue), Power (orange), Mastery (purple)

## Commands
- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS  
- `npm run web` - Run on web

## Architecture
- React Native with Expo
- TypeScript
- React Navigation for routing
- Supabase for backend
- Centralized theme system in `/src/theme/`