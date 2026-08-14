import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { COLORS } from '../theme/colors';
import InteractiveLoop from '../components/InteractiveLoop';
import SimulatorChart from '../components/SimulatorChart';
import { loadCompletedQuests, saveCompletedQuests, loadPortfolio, savePortfolio } from '../utils/storage';

const SIP_PRESETS = [21, 50, 100, 250, 500];
const BORROW_PRESETS = [2000, 5000, 15000, 30000, 50000];
const YEAR_PRESETS = [3, 5, 10, 15];

export default function SimulatorTab({ onTriggerConfetti, onRefreshPortfolio }) {
  const [activeNodeId, setActiveNodeId] = useState('save');
  const [sipAmount, setSipAmount] = useState(100);
  const [borrowAmount, setBorrowAmount] = useState(15000);
  const [years, setYears] = useState(5);
  const [questCompleted, setQuestCompleted] = useState(false);

  useEffect(() => {
    const checkQuest = async () => {
      const completed = await loadCompletedQuests();
      if (completed.includes('simulate_trial')) {
        setQuestCompleted(true);
      }
    };
    checkQuest();
  }, []);

  const handleCompleteSimulationQuest = async () => {
    if (questCompleted) return;

    try {
      const completed = await loadCompletedQuests();
      if (!completed.includes('simulate_trial')) {
        const updated = [...completed, 'simulate_trial'];
        await saveCompletedQuests(updated);

        const profile = await loadPortfolio();
        profile.xp = (profile.xp || 0) + 50;
        await savePortfolio(profile);

        setQuestCompleted(true);
        onTriggerConfetti();
        if (onRefreshPortfolio) onRefreshPortfolio();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Blink Loop</Text>
        <Text style={styles.subtitle}>Interact with the nodes to see how wealth flows.</Text>
      </View>

      <InteractiveLoop activeNodeId={activeNodeId} onSelectNode={setActiveNodeId} />

      <View style={styles.sectionDivider} />
      <View style={styles.simulatorCard}>
        <View style={styles.simHeader}>
          <Text style={styles.simTitle}>Liquid Wealth Simulator</Text>
          <Text style={styles.simSubtitle}>Compare borrowing against your assets vs selling them.</Text>
        </View>

        <View style={styles.inputWrapper}>
          <View style={styles.inputLabelRow}>
            <Text style={styles.inputLabel}>Daily SIP Contribution</Text>
            <Text style={styles.inputValue}>₹{sipAmount}</Text>
          </View>
          <View style={styles.presetsRow}>
            {SIP_PRESETS.map((val) => (
              <TouchableOpacity
                key={`sip-${val}`}
                activeOpacity={0.7}
                onPress={() => setSipAmount(val)}
                style={[
                  styles.presetBtn,
                  sipAmount === val && styles.presetBtnActive,
                ]}
              >
                <Text style={[styles.presetText, sipAmount === val && styles.presetTextActive]}>
                  ₹{val}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.inputWrapper}>
          <View style={styles.inputLabelRow}>
            <Text style={styles.inputLabel}>Emergency / Borrow Amount</Text>
            <Text style={styles.inputValue}>₹{borrowAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.presetsRow}>
            {BORROW_PRESETS.map((val) => (
              <TouchableOpacity
                key={`borrow-${val}`}
                activeOpacity={0.7}
                onPress={() => setBorrowAmount(val)}
                style={[
                  styles.presetBtn,
                  borrowAmount === val && styles.presetBtnActive,
                ]}
              >
                <Text style={[styles.presetText, borrowAmount === val && styles.presetTextActive]}>
                  ₹{(val / 1000).toFixed(0)}k
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.inputWrapper}>
          <View style={styles.inputLabelRow}>
            <Text style={styles.inputLabel}>Compounding Period</Text>
            <Text style={styles.inputValue}>{years} Years</Text>
          </View>
          <View style={styles.presetsRow}>
            {YEAR_PRESETS.map((val) => (
              <TouchableOpacity
                key={`years-${val}`}
                activeOpacity={0.7}
                onPress={() => setYears(val)}
                style={[
                  styles.presetBtn,
                  years === val && styles.presetBtnActive,
                ]}
              >
                <Text style={[styles.presetText, years === val && styles.presetTextActive]}>
                  {val} yrs
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      <SimulatorChart sipAmount={sipAmount} borrowAmount={borrowAmount} years={years} />
      <View style={styles.actionContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCompleteSimulationQuest}
          style={[
            styles.actionBtn,
            questCompleted && styles.actionBtnDisabled,
          ]}
          disabled={questCompleted}
        >
          <Text style={styles.actionBtnText}>
            {questCompleted ? '⚡ Simulation Complete (+50 XP)' : 'Claim Simulation XP (+50 XP)'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: 16,
    width: '90%',
    alignSelf: 'center',
    opacity: 0.5,
  },
  simulatorCard: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  simHeader: {
    marginBottom: 16,
  },
  simTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  simSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  inputValue: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '800',
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetBtn: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  presetBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(159, 232, 112, 0.08)',
  },
  presetText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  presetTextActive: {
    color: COLORS.primary,
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  actionBtnDisabled: {
    backgroundColor: COLORS.cardBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  actionBtnText: {
    color: COLORS.primaryContrast,
    fontSize: 14,
    fontWeight: '800',
  },
});
