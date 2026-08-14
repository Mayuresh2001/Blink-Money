import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../theme/colors';

export default function SimulatorChart({ sipAmount, borrowAmount, years }) {
  const monthlyContribution = sipAmount * 30.5;
  const totalMonths = years * 12;
  const monthlyRate = 0.12 / 12;

  const compoundMultiplier = (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate * (1 + monthlyRate);
  const blinkAssetValue = monthlyContribution * compoundMultiplier;
  const totalPrincipal = monthlyContribution * totalMonths;

  const loanCost = borrowAmount * 0.0999 * years;
  const blinkNetValue = Math.max(0, blinkAssetValue - loanCost);

  const remainingYears = Math.max(0, years - 1);
  const lostCompounding = borrowAmount * Math.pow(1 + 0.12, remainingYears);

  const liquidateAssetValue = Math.max(0, blinkAssetValue - lostCompounding);

  const blinkBenefit = Math.max(0, blinkNetValue - liquidateAssetValue);

  const maxVal = Math.max(blinkAssetValue, blinkNetValue, liquidateAssetValue) || 1;
  const blinkHeightPct = (blinkNetValue / maxVal) * 100;
  const liquidateHeightPct = (liquidateAssetValue / maxVal) * 100;
  const lostCompoundingHeightPct = ((lostCompounding) / maxVal) * 100;

  const blinkColumnStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(`${blinkHeightPct}%`, { duration: 300 }),
    };
  });

  const liquidateColumnStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(`${liquidateHeightPct}%`, { duration: 300 }),
    };
  });

  const formatCurrency = (val) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    }
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Total Invested</Text>
          <Text style={styles.metricVal}>{formatCurrency(totalPrincipal)}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Blink Net Wealth</Text>
          <Text style={[styles.metricVal, { color: COLORS.primary }]}>
            {formatCurrency(blinkNetValue)}
          </Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Blink Net Profit</Text>
          <Text style={[styles.metricVal, { color: COLORS.save }]}>
            {formatCurrency(Math.max(0, blinkNetValue - totalPrincipal))}
          </Text>
        </View>
      </View>
      <View style={styles.chartContainer}>
        <View style={styles.chartBackground}>
          <View style={styles.gridLine} />
          <View style={styles.gridLine} />
          <View style={styles.gridLine} />
          <View style={styles.gridLine} />
        </View>
        <View style={styles.columnsWrapper}>
          <View style={styles.columnContainer}>
            <View style={styles.columnBarWrapper}>
              <Animated.View style={[styles.bar, styles.blinkBar, blinkColumnStyle]}>
                <View style={styles.glowTop} />
                <Text style={styles.barLabel}>{formatCurrency(blinkNetValue)}</Text>
              </Animated.View>
            </View>
            <Text style={styles.columnLabel}>Blink Way</Text>
            <Text style={styles.columnSubLabel}>Loan against Assets</Text>
          </View>
          <View style={styles.columnContainer}>
            <View style={styles.columnBarWrapper}>
              <Animated.View style={[styles.bar, styles.liquidateBar, liquidateColumnStyle]}>
                <Text style={styles.barLabel}>{formatCurrency(liquidateAssetValue)}</Text>
              </Animated.View>
            </View>
            <Text style={styles.columnLabel}>Liquidate Way</Text>
            <Text style={[styles.columnSubLabel, { color: COLORS.borrow }]}>Selling Assets</Text>
          </View>
        </View>
      </View>
      <View style={styles.insightBanner}>
        <Text style={styles.insightEmoji}>💡</Text>
        <View style={styles.insightTextContent}>
          <Text style={styles.insightTitle}>
            Blink Saves You <Text style={{ color: COLORS.save }}>{formatCurrency(blinkBenefit)}</Text>
          </Text>
          <Text style={styles.insightDesc}>
            By borrowing at 9.99% against your assets instead of liquidating them, you prevent breaking your 12% compounding cycle. Your assets continue growing!
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  chartContainer: {
    height: 180,
    position: 'relative',
    marginVertical: 10,
    justifyContent: 'flex-end',
  },
  chartBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 30,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    opacity: 0.4,
    width: '100%',
  },
  columnsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
    paddingBottom: 25,
  },
  columnContainer: {
    alignItems: 'center',
    width: '45%',
  },
  columnBarWrapper: {
    height: 125,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 50,
    borderRadius: 8,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  blinkBar: {
    backgroundColor: COLORS.save,
    shadowColor: COLORS.save,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  liquidateBar: {
    backgroundColor: COLORS.textMuted,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  glowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    borderRadius: 8,
    backgroundColor: '#C7FFA3',
  },
  barLabel: {
    position: 'absolute',
    top: -22,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    width: 80,
  },
  columnLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
  },
  columnSubLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  insightBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(159, 232, 112, 0.08)',
    borderColor: 'rgba(159, 232, 112, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
  },
  insightEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  insightTextContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  insightDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
});
