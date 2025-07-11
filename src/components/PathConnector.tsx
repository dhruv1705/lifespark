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
    const screenWidth = 375; 
    const nodeRadius = 40; 
    const marginXL = 20; 
    const progressRadius = 37; 
    
    const centerX = screenWidth / 2; 
    const leftX = marginXL + nodeRadius; 
    const rightX = screenWidth - marginXL - nodeRadius; 
    
    const startX = fromPosition === 'left' ? leftX : fromPosition === 'right' ? rightX : centerX;
    const endX = toPosition === 'left' ? leftX : toPosition === 'right' ? rightX : centerX;
    const startY = 0; 
    const endY = height - 65; 
    if (Math.abs(endX - startX) > 50) {
      const midY = height / 2;
      const controlOffset = Math.abs(endX - startX) * 0.4;
      
      const cp1X = startX + (endX > startX ? controlOffset : -controlOffset);
      const cp1Y = startY + height * 0.25;
      const cp2X = endX + (endX > startX ? -controlOffset : controlOffset);
      const cp2Y = endY - height * 0.25;
      
      return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
    } else {
      const controlOffset = 30;
      const cp1X = startX + (endX - startX) * 0.5 + controlOffset;
      const cp1Y = startY + height * 0.4;
      const cp2X = startX + (endX - startX) * 0.5 - controlOffset;
      const cp2Y = startY + height * 0.6;
      
      return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
    }
  };

  const getStrokeColor = () => {
    return isCompleted ? theme.colors.primary.green : '#A0A0A0'; 
  };

  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height={height} style={styles.svg}>
        <Path
          d={getPathData()}
          stroke={getStrokeColor()}
          strokeWidth={3}
          strokeDasharray="8,6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.8}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 125, 
    left: 0,
    right: 0,
    zIndex: 0,
  },
  svg: {
    position: 'absolute',
  },
});