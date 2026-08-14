import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  STREAK_INFO: '@blink_streak_info',
  COMPLETED_QUESTS: '@blink_completed_quests',
  CLAIMED_REWARDS: '@blink_claimed_rewards',
  USER_PORTFOLIO: '@blink_user_portfolio',
};

const DEFAULT_PORTFOLIO = {
  balance: 24500,
  stocksAmount: 15960,
  fdAmount: 3552,
  goldAmount: 2143,
  borrowedAmount: 0,
  xp: 0,
};

const DEFAULT_STREAK = {
  streakCount: 3,
  lastCheckInDate: '',
  claimedToday: false,
  checkInHistory: [true, true, true, false, false, false, false],
};

export const loadPortfolio = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PORTFOLIO);
    return data ? JSON.parse(data) : DEFAULT_PORTFOLIO;
  } catch (error) {
    console.error('Error loading portfolio:', error);
    return DEFAULT_PORTFOLIO;
  }
};

export const savePortfolio = async (portfolio) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PORTFOLIO, JSON.stringify(portfolio));
  } catch (error) {
    console.error('Error saving portfolio:', error);
  }
};

export const loadStreak = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_INFO);
    if (!data) return DEFAULT_STREAK;

    const parsed = JSON.parse(data);
    const todayStr = new Date().toISOString().split('T')[0];

    const claimedToday = parsed.lastCheckInDate === todayStr;

    let streakCount = parsed.streakCount;
    let checkInHistory = parsed.checkInHistory || [false, false, false, false, false, false, false];

    if (parsed.lastCheckInDate) {
      const lastDate = new Date(parsed.lastCheckInDate);
      const today = new Date(todayStr);
      const diffTime = Math.abs(today - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1 && !claimedToday) {
        streakCount = 0;
        checkInHistory = [false, false, false, false, false, false, false];
      }
    }

    return {
      ...parsed,
      streakCount,
      claimedToday,
      checkInHistory,
    };
  } catch (error) {
    console.error('Error loading streak:', error);
    return DEFAULT_STREAK;
  }
};

export const saveStreak = async (streakData) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.STREAK_INFO, JSON.stringify(streakData));
  } catch (error) {
    console.error('Error saving streak:', error);
  }
};

export const loadCompletedQuests = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_QUESTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading completed quests:', error);
    return [];
  }
};

export const saveCompletedQuests = async (quests) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.COMPLETED_QUESTS, JSON.stringify(quests));
  } catch (error) {
    console.error('Error saving completed quests:', error);
  }
};

export const loadClaimedRewards = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CLAIMED_REWARDS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading claimed rewards:', error);
    return [];
  }
};

export const saveClaimedRewards = async (rewards) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CLAIMED_REWARDS, JSON.stringify(rewards));
  } catch (error) {
    console.error('Error saving claimed rewards:', error);
  }
};

export const clearStorage = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};
