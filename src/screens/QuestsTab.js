import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { COLORS } from '../theme/colors';
import ScratchCard from '../components/ScratchCard';
import {
  loadStreak,
  saveStreak,
  loadCompletedQuests,
  loadClaimedRewards,
  saveClaimedRewards,
  loadPortfolio,
  savePortfolio,
} from '../utils/storage';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const QUEST_LIST = [
  {
    id: 'simulate_trial',
    title: 'The Loop Analyst',
    desc: 'Run a compound simulation comparing Blink credit against liquidation.',
    xp: 50,
    rewardText: '₹25 Liquid Account Bonus',
    cashReward: 25,
    icon: '🔮',
  },
  {
    id: 'first_deposit',
    title: 'Wealth Catalyst',
    desc: 'Make your first quick-deposit (₹21 or more) to kickstart compounding.',
    xp: 80,
    rewardText: '₹50 Gold Mutual Fund Voucher',
    cashReward: 50,
    icon: '⚡',
  },
  {
    id: 'share_card',
    title: 'Compounding Ambassador',
    desc: 'Build and share your compounding streak card on social media.',
    xp: 100,
    rewardText: '₹75 Cash reward in Liquid Balance',
    cashReward: 75,
    icon: '📣',
  },
];

export default function QuestsTab({ onTriggerConfetti, onRefreshPortfolio }) {
  const [streak, setStreak] = useState({
    streakCount: 0,
    claimedToday: false,
    checkInHistory: [false, false, false, false, false, false, false],
  });

  const [completedQuests, setCompletedQuests] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);
  
  // Scratch card modal state
  const [activeScratchQuest, setActiveScratchQuest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const loadedStreak = await loadStreak();
    const loadedCompleted = await loadCompletedQuests();
    const loadedClaimed = await loadClaimedRewards();
    setStreak(loadedStreak);
    setCompletedQuests(loadedCompleted);
    setClaimedRewards(loadedClaimed);
  };

  const handleDailyCheckIn = async () => {
    if (streak.claimedToday) return;

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayIndex = (new Date().getDay() + 6) % 7; // Convert 0-6 Sun-Sat to 0-6 Mon-Sun
      
      const newHistory = [...streak.checkInHistory];
      newHistory[todayIndex] = true;

      const newStreakData = {
        streakCount: streak.streakCount + 1,
        lastCheckInDate: todayStr,
        claimedToday: true,
        checkInHistory: newHistory,
      };

      await saveStreak(newStreakData);
      setStreak(newStreakData);
      onTriggerConfetti();

      // Complete quest or add XP
      const profile = await loadPortfolio();
      profile.xp = (profile.xp || 0) + 20; // 20 XP for daily checkin
      await savePortfolio(profile);
      if (onRefreshPortfolio) onRefreshPortfolio();
    } catch (e) {
      console.error(e);
    }
  };

  const openScratchCard = (quest) => {
    setActiveScratchQuest(quest);
    setModalVisible(true);
  };

  const handleScratchComplete = async () => {
    if (!activeScratchQuest) return;

    try {
      const updatedClaimed = [...claimedRewards, activeScratchQuest.id];
      await saveClaimedRewards(updatedClaimed);
      setClaimedRewards(updatedClaimed);

      // Award XP & cash value to portfolio
      const profile = await loadPortfolio();
      profile.xp = (profile.xp || 0) + activeScratchQuest.xp;
      profile.balance = (profile.balance || 0) + activeScratchQuest.cashReward;
      
      // Allocate cash reward to Mutual Funds (Stocks) or Cash
      profile.stocksAmount = (profile.stocksAmount || 0) + activeScratchQuest.cashReward;
      
      await savePortfolio(profile);
      
      onTriggerConfetti();
      if (onRefreshPortfolio) onRefreshPortfolio();

      // Close modal after a short delay
      setTimeout(() => {
        setModalVisible(false);
        setActiveScratchQuest(null);
      }, 1500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Title Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quests & Rewards</Text>
        <Text style={styles.subtitle}>Maintain your streak and claim compounding cards.</Text>
      </View>

      {/* Streak Board Card */}
      <View style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <View style={styles.flameContainer}>
            <Text style={styles.flameIcon}>⚡</Text>
            <View>
              <Text style={styles.streakCountText}>{streak.streakCount} Days</Text>
              <Text style={styles.streakLabel}>Active Savings Streak</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDailyCheckIn}
            disabled={streak.claimedToday}
            style={[
              styles.checkInBtn,
              streak.claimedToday && styles.checkInBtnDisabled,
            ]}
          >
            <Text style={[styles.checkInBtnText, streak.claimedToday && styles.checkInBtnTextDisabled]}>
              {streak.claimedToday ? 'Claimed' : 'Check-In'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Days grid */}
        <View style={styles.daysGrid}>
          {DAYS_OF_WEEK.map((day, idx) => {
            const todayIndex = (new Date().getDay() + 6) % 7;
            const isToday = idx === todayIndex;
            const isChecked = streak.checkInHistory[idx];

            return (
              <View key={day} style={styles.dayCol}>
                <Text style={[styles.dayLabel, isToday && { color: COLORS.primary }]}>{day}</Text>
                <View
                  style={[
                    styles.dayCircle,
                    isChecked && styles.dayCircleChecked,
                    isToday && !isChecked && styles.dayCircleToday,
                  ]}
                >
                  {isChecked ? (
                    <Text style={styles.checkMark}>✓</Text>
                  ) : isToday ? (
                    <Text style={styles.flameDot}>🔥</Text>
                  ) : (
                    <View style={styles.emptyDot} />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Quest Section */}
      <View style={styles.questSection}>
        <Text style={styles.sectionTitle}>Available Quests</Text>
        
        {QUEST_LIST.map((quest) => {
          const isCompleted = completedQuests.includes(quest.id);
          const isClaimed = claimedRewards.includes(quest.id);

          return (
            <View key={quest.id} style={styles.questItem}>
              <View style={styles.questLeft}>
                <Text style={styles.questIcon}>{quest.icon}</Text>
                <View style={styles.questTextContainer}>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <Text style={styles.questDesc}>{quest.desc}</Text>
                  <Text style={styles.questRewardText}>Reward: {quest.rewardText}</Text>
                </View>
              </View>

              <View style={styles.questRight}>
                {isClaimed ? (
                  <View style={styles.badgeClaimed}>
                    <Text style={styles.badgeClaimedText}>Claimed</Text>
                  </View>
                ) : isCompleted ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => openScratchCard(quest)}
                    style={styles.claimBtn}
                  >
                    <Text style={styles.claimBtnText}>Scratch</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.badgeLocked}>
                    <Text style={styles.badgeLockedText}>Locked</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Scratch Card Modal Overlay */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setModalVisible(false)}
              style={styles.closeModalBtn}
            >
              <Text style={styles.closeModalText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Scratch Card Reward!</Text>
            <Text style={styles.modalSubtitle}>
              Scratch off the cover to reveal your Blink bonus.
            </Text>

            {activeScratchQuest && (
              <ScratchCard
                prizeText={activeScratchQuest.rewardText}
                onScratchComplete={handleScratchComplete}
              />
            )}
            
            <Text style={styles.scratchNotice}>
              Swipe your finger back and forth across the card
            </Text>
          </View>
        </View>
      </Modal>
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
  streakCard: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  flameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flameIcon: {
    fontSize: 28,
    marginRight: 10,
    color: COLORS.accentGold,
  },
  streakCountText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  streakLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  checkInBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  checkInBtnDisabled: {
    backgroundColor: COLORS.cardBorder,
  },
  checkInBtnText: {
    color: COLORS.primaryContrast,
    fontSize: 12,
    fontWeight: '800',
  },
  checkInBtnTextDisabled: {
    color: COLORS.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '700',
    marginBottom: 6,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleChecked: {
    backgroundColor: COLORS.saveBg,
    borderColor: COLORS.save,
  },
  dayCircleToday: {
    borderColor: COLORS.accentGold,
    backgroundColor: COLORS.accentGoldBg,
  },
  checkMark: {
    color: COLORS.save,
    fontSize: 14,
    fontWeight: '800',
  },
  flameDot: {
    fontSize: 14,
  },
  emptyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.cardBorder,
  },
  questSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  questItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  questLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 10,
  },
  questIcon: {
    fontSize: 22,
    marginRight: 12,
    marginTop: 2,
  },
  questTextContainer: {
    flex: 1,
  },
  questTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  questDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 14,
  },
  questRewardText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 6,
  },
  questRight: {
    justifyContent: 'center',
  },
  claimBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  claimBtnText: {
    color: COLORS.primaryContrast,
    fontSize: 12,
    fontWeight: '800',
  },
  badgeLocked: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeLockedText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  badgeClaimed: {
    backgroundColor: COLORS.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeClaimedText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '95%',
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  closeModalBtn: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
  },
  closeModalText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  scratchNotice: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 16,
    fontWeight: '600',
  },
});
