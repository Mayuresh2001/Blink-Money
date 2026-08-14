import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS } from './src/theme/colors';
import PortfolioTab from './src/screens/PortfolioTab';
import SimulatorTab from './src/screens/SimulatorTab';
import QuestsTab from './src/screens/QuestsTab';
import Confetti from './src/components/Confetti';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function App() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const triggerConfetti = () => {
    setConfettiTrigger((prev) => prev + 1);
  };

  const handleRefreshData = () => {
    setRefreshTrigger((prev) => !prev);
  };

  const handleNavigateToQuests = () => {
    setActiveTab('quests');
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'portfolio':
        return (
          <PortfolioTab
            onTriggerConfetti={triggerConfetti}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'simulator':
        return (
          <SimulatorTab
            onTriggerConfetti={triggerConfetti}
            onRefreshPortfolio={handleRefreshData}
          />
        );
      case 'quests':
        return (
          <QuestsTab
            onTriggerConfetti={triggerConfetti}
            onRefreshPortfolio={handleRefreshData}
          />
        );
      default:
        return (
          <PortfolioTab
            onTriggerConfetti={triggerConfetti}
            refreshTrigger={refreshTrigger}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <View style={styles.topHeader}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <View style={styles.logoInner} />
          </View>
          <Text style={styles.logoText}>
            Blink<Text style={{ color: COLORS.primary }}>Money</Text>
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleNavigateToQuests}
          style={styles.streakBadge}
        >
          <Text style={styles.streakBadgeText}>🔥 Quests</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.screenArea}>
        {renderActiveScreen()}
      </View>
      <View style={styles.tabBar}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('portfolio')}
          style={[styles.tabItem, activeTab === 'portfolio' && styles.tabItemActive]}
        >
          <Text style={styles.tabIcon}>💰</Text>
          <Text style={[styles.tabLabel, activeTab === 'portfolio' && styles.tabLabelActive]}>
            Portfolio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('simulator')}
          style={[styles.tabItem, activeTab === 'simulator' && styles.tabItemActive]}
        >
          <Text style={styles.tabIcon}>🔄</Text>
          <Text style={[styles.tabLabel, activeTab === 'simulator' && styles.tabLabelActive]}>
            Blink Loop
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('quests')}
          style={[styles.tabItem, activeTab === 'quests' && styles.tabItemActive]}
        >
          <Text style={styles.tabIcon}>🎁</Text>
          <Text style={[styles.tabLabel, activeTab === 'quests' && styles.tabLabelActive]}>
            Quests
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('share')}
          style={[styles.tabItem, activeTab === 'share' && styles.tabItemActive]}
        >
          <Text style={styles.tabIcon}>📣</Text>
          <Text style={[styles.tabLabel, activeTab === 'share' && styles.tabLabelActive]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>
      <Confetti trigger={confettiTrigger} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    backgroundColor: COLORS.background,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(159, 232, 112, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  streakBadge: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakBadgeText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '800',
  },
  screenArea: {
    flex: 1,
    marginBottom: 38
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 34, 16, 0.95)',
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingVertical: 8,
    paddingBottom: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    width: width / 4 - 10,
    borderRadius: 12,
    opacity: 0.5,
  },
  tabItemActive: {
    opacity: 1,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
});
