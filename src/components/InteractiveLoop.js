import { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
  useDerivedValue,
} from 'react-native-reanimated';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');
const CONTAINER_SIZE = width * 0.85;
const RADIUS = CONTAINER_SIZE * 0.35;
const CENTER = CONTAINER_SIZE / 2;

const NODES = [
  {
    id: 'save',
    title: 'SAVE',
    color: COLORS.save,
    bg: COLORS.saveBg,
    icon: '💰',
    badge: 'Daily SIP',
    angle: -Math.PI / 2,
    desc: 'Auto-invest daily from as low as ₹21. Diversified across top mutual funds, gold, and FDs to spread risk.',
  },
  {
    id: 'grow',
    title: 'GROW',
    color: COLORS.grow,
    bg: COLORS.growBg,
    icon: '📈',
    badge: 'Compounding',
    angle: 0,
    desc: 'Watch your wealth build up in a Liquid Wealth Account. Compounding occurs continuously at competitive market rates.',
  },
  {
    id: 'borrow',
    title: 'BORROW',
    color: COLORS.borrow,
    bg: COLORS.borrowBg,
    icon: '💳',
    badge: 'Instant Loan',
    angle: Math.PI / 2,
    desc: 'Access instant credit up to 90% of your portfolio value at 9.99% p.a. No processing fees or pre-payment penalties.',
  },
  {
    id: 'still_grow',
    title: 'STILL GROW',
    color: COLORS.primary,
    bg: COLORS.cardBorder,
    icon: '🔄',
    badge: 'No Lock-in',
    angle: Math.PI,
    desc: 'Compounding NEVER breaks! Even when you borrow, your entire portfolio continues to compound in the background.',
  },
];

export default function InteractiveLoop({ activeNodeId, onSelectNode }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(2 * Math.PI, {
        duration: 8000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const activeNode = NODES.find((n) => n.id === activeNodeId) || NODES[0];

  const renderParticle = (index) => {
    const offsetAngle = (index * 2 * Math.PI) / 3;

    const animatedStyle = useAnimatedStyle(() => {
      const theta = rotation.value + offsetAngle;
      const x = CENTER - 8 + RADIUS * Math.cos(theta);
      const y = CENTER - 8 + RADIUS * Math.sin(theta);
      return {
        left: x,
        top: y,
      };
    });

    return (
      <Animated.View
        key={`particle-${index}`}
        style={[styles.particle, animatedStyle]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.orbitArea, { width: CONTAINER_SIZE, height: CONTAINER_SIZE }]}>
        <View
          style={[
            styles.trackBorder,
            {
              width: RADIUS * 2,
              height: RADIUS * 2,
              borderRadius: RADIUS,
              left: CENTER - RADIUS,
              top: CENTER - RADIUS,
            },
          ]}
        />
        <View
          style={[
            styles.centerCore,
            {
              left: CENTER - CONTAINER_SIZE * 0.22,
              top: CENTER - CONTAINER_SIZE * 0.22,
              width: CONTAINER_SIZE * 0.44,
              height: CONTAINER_SIZE * 0.44,
            },
          ]}
        >
          <Text style={styles.centerIcon}>{activeNode.icon}</Text>
          <Text style={[styles.centerTitle, { color: activeNode.color }]}>
            {activeNode.title}
          </Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{activeNode.badge}</Text>
          </View>
        </View>

        {[0, 1, 2].map((i) => renderParticle(i))}

        {NODES.map((node) => {
          const x = CENTER - 26 + RADIUS * Math.cos(node.angle);
          const y = CENTER - 26 + RADIUS * Math.sin(node.angle);
          const isActive = node.id === activeNodeId;

          return (
            <TouchableOpacity
              key={node.id}
              activeOpacity={0.8}
              onPress={() => onSelectNode(node.id)}
              style={[
                styles.nodeButton,
                {
                  left: x,
                  top: y,
                  borderColor: isActive ? node.color : COLORS.cardBorder,
                  backgroundColor: isActive ? COLORS.background : COLORS.cardBg,
                  shadowColor: node.color,
                  shadowOpacity: isActive ? 0.3 : 0,
                },
              ]}
            >
              <Text style={styles.nodeIcon}>{node.icon}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Animated.View style={styles.detailCard}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: activeNode.color }]}>
            {activeNode.title}
          </Text>
          <View style={[styles.cardLine, { backgroundColor: activeNode.color }]} />
        </View>
        <Text style={styles.cardDesc}>{activeNode.desc}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  orbitArea: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackBorder: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    borderStyle: 'dashed',
  },
  centerCore: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 3,
  },
  centerIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  centerTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  badgeContainer: {
    backgroundColor: COLORS.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  particle: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  nodeButton: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 4,
  },
  nodeIcon: {
    fontSize: 20,
  },
  detailCard: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    width: '90%',
    marginTop: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginRight: 10,
  },
  cardLine: {
    flex: 1,
    height: 1,
    borderRadius: 1,
    opacity: 0.3,
  },
  cardDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
