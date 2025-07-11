import React, { useEffect, useRef, useState } from 'react';
import { Text, Animated, TextStyle, StyleProp } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  useGrouping?: boolean;
  animated?: boolean;
  startValue?: number;
  bounceOnChange?: boolean;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1000,
  style,
  prefix = '',
  suffix = '',
  decimals = 0,
  useGrouping = true,
  animated = true,
  startValue = 0,
  bounceOnChange = false,
}) => {
  const [displayValue, setDisplayValue] = useState(startValue);
  const animatedValue = useRef(new Animated.Value(startValue)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const previousValue = useRef(startValue);

  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    if (bounceOnChange && value !== previousValue.current) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }

    let isActive = true;
    const listener = animatedValue.addListener(({ value: animValue }) => {
      if (isActive) {
        setDisplayValue(animValue);
      }
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration: duration,
      useNativeDriver: false,
    }).start();

    previousValue.current = value;

    return () => {
      isActive = false;
      animatedValue.removeListener(listener);
    };
  }, [value, animated, duration, bounceOnChange]);

  const formatNumber = (num: number) => {
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: useGrouping,
    };
    return num.toLocaleString(undefined, options);
  };

  return (
    <Animated.Text
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {prefix}{formatNumber(displayValue)}{suffix}
    </Animated.Text>
  );
};