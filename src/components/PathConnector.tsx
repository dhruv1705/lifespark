import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../theme';

interface PathConnectorProps {
  fromPosition: 'left' | 'right' | 'center';
  toPosition: 'left' | 'right' | 'center';
  isCompleted: boolean;
  height?: number;
  showProgress?: boolean;
  progress?: number; // 0-100
}

export const PathConnector: React.FC<PathConnectorProps> = ({
  fromPosition,
  toPosition,
  isCompleted,
  height = 80,
  showProgress = false,
  progress = 0,
}) => {
  const getPathData = () => {
    const centerX = 187.5; // Half of screen width (375/2)
    const leftX = 70;
    const rightX = 305;
    
    const startX = fromPosition === 'left' ? leftX : fromPosition === 'right' ? rightX : centerX;
    const endX = toPosition === 'left' ? leftX : toPosition === 'right' ? rightX : centerX;
    
    const startY = 0;
    const endY = height;
    
    // Create smoother S-curves for better visual flow
    if (Math.abs(endX - startX) > 50) {
      // Large horizontal movement - use S-curve
      const midY = height / 2;
      const controlOffset = Math.abs(endX - startX) * 0.4;
      
      const cp1X = startX + (endX > startX ? controlOffset : -controlOffset);
      const cp1Y = startY + height * 0.25;
      const cp2X = endX + (endX > startX ? -controlOffset : controlOffset);
      const cp2Y = endY - height * 0.25;
      
      return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
    } else {
      // Small or no horizontal movement - use gentle curve
      const controlOffset = 30;
      const cp1X = startX + (endX - startX) * 0.5 + controlOffset;
      const cp1Y = startY + height * 0.4;
      const cp2X = startX + (endX - startX) * 0.5 - controlOffset;
      const cp2Y = startY + height * 0.6;
      
      return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
    }
  };

  const getStrokeColor = () => {
    return isCompleted ? theme.colors.primary.green : theme.colors.text.disabled;
  };

  return (
    <View style={[styles.container, { height }]}>
      <Svg height={height} width={375} style={styles.svg}>
        {/* Base path */}
        <Path
          d={getPathData()}
          stroke={theme.colors.border}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          opacity={0.3}
        />
        {/* Progress path */}
        {(isCompleted || showProgress) && (
          <Path
            d={getPathData()}
            stroke={getStrokeColor()}
            strokeWidth={isCompleted ? 4 : 3}
            strokeLinecap="round"
            strokeDasharray={isCompleted ? "0" : showProgress ? `${progress},${100-progress}` : "6,6"}
            fill="none"
            opacity={isCompleted ? 0.9 : 0.6}
          />
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40, // Half of new node height (80/2) to center the connection
    left: 0,
    right: 0,
    zIndex: -1,
  },
  svg: {
    position: 'absolute',
  },
});