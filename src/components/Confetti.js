import { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COLORS = [
  COLORS.primary,
  COLORS.save,
  COLORS.grow,
  COLORS.accentGold,
  '#FF7E82',
  '#FFFFFF',
];

export default function Confetti({ trigger, onComplete }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (trigger > 0) {
      const newParticles = Array.from({ length: 45 }).map((_, index) => {
        const size = Math.random() * 8 + 6; // 6 to 14
        const startX = Math.random() * SCREEN_WIDTH;
        const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        const shape = Math.random() > 0.5 ? 'circle' : 'square';

        return {
          id: `p-${trigger}-${index}`,
          size,
          startX,
          color,
          shape,
          duration: Math.random() * 1500 + 1500,
          delay: Math.random() * 600,
          rotationSpeed: Math.random() * 720 + 360,
          horizontalDrift: (Math.random() - 0.5) * 100,
        };
      });

      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        if (onComplete) onComplete();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <ConfettiParticle key={p.id} config={p} />
      ))}
    </View>
  );
}

function ConfettiParticle({ config }) {
  const y = useSharedValue(-20);
  const x = useSharedValue(config.startX);
  const rotate = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      config.delay,
      withTiming(SCREEN_HEIGHT + 20, {
        duration: config.duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );

    x.value = withDelay(
      config.delay,
      withTiming(config.startX + config.horizontalDrift, {
        duration: config.duration,
        easing: Easing.linear,
      })
    );

    rotate.value = withDelay(
      config.delay,
      withTiming(config.rotationSpeed, {
        duration: config.duration,
        easing: Easing.linear,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      top: y.value,
      left: x.value,
      transform: [
        { rotate: `${rotate.value}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          width: config.size,
          height: config.size,
          backgroundColor: config.color,
          borderRadius: config.shape === 'circle' ? config.size / 2 : 2,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    opacity: 0.85,
  },
});
