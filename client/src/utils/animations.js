import { Animated, Easing } from 'react-native';

// Animation configurations
export const ANIMATION_DURATION = {
  fast: 200,
  medium: 300,
  slow: 500,
};

export const EASING = {
  easeInOut: Easing.bezier(0.4, 0, 0.2, 1),
  easeOut: Easing.bezier(0, 0, 0.2, 1),
  easeIn: Easing.bezier(0.4, 0, 1, 1),
  bounce: Easing.bounce,
  elastic: Easing.elastic(1),
};

// Button press animation
export const createButtonPressAnimation = (animatedValue, scale = 0.95) => {
  return {
    onPressIn: () => {
      Animated.spring(animatedValue, {
        toValue: scale,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    },
    onPressOut: () => {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    },
  };
};

// Fade in animation
export const createFadeInAnimation = (animatedValue, duration = ANIMATION_DURATION.medium) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    easing: EASING.easeOut,
    useNativeDriver: true,
  });
};

// Slide in animation
export const createSlideInAnimation = (animatedValue, fromValue = 50, duration = ANIMATION_DURATION.medium) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: EASING.easeOut,
    useNativeDriver: true,
  });
};

// Scale animation
export const createScaleAnimation = (animatedValue, toValue = 1, duration = ANIMATION_DURATION.medium) => {
  return Animated.spring(animatedValue, {
    toValue,
    useNativeDriver: true,
    tension: 100,
    friction: 8,
  });
};

// Pulse animation
export const createPulseAnimation = (animatedValue, minScale = 0.95, maxScale = 1.05) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: maxScale,
        duration: 1000,
        easing: EASING.easeInOut,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: minScale,
        duration: 1000,
        easing: EASING.easeInOut,
        useNativeDriver: true,
      }),
    ])
  );
};

// Shake animation
export const createShakeAnimation = (animatedValue) => {
  return Animated.sequence([
    Animated.timing(animatedValue, { toValue: 10, duration: 100, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: -10, duration: 100, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: 10, duration: 100, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: 0, duration: 100, useNativeDriver: true }),
  ]);
};

// Stagger animation for lists
export const createStaggerAnimation = (animatedValues, delay = 100) => {
  return Animated.stagger(
    delay,
    animatedValues.map(value =>
      Animated.timing(value, {
        toValue: 1,
        duration: ANIMATION_DURATION.medium,
        easing: EASING.easeOut,
        useNativeDriver: true,
      })
    )
  );
};

// Loading animation
export const createLoadingAnimation = (animatedValue) => {
  return Animated.loop(
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};
