import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
} from 'react-native';
import { COLORS } from '../theme/colors';
import {
  loadCompletedQuests,
  saveCompletedQuests,
  loadPortfolio,
  savePortfolio,
  loadStreak,
} from '../utils/storage';

const THEMES = [
  {
    id: 'forest',
    name: 'Forest Glow',
    bg: '#1C3116',
    border: COLORS.primary,
    accent: COLORS.primary,
    textColor: COLORS.text,
  },
  {
    id: 'carbon',
    name: 'Cyber Neon',
    bg: '#0F0F14',
    border: COLORS.grow,
    accent: COLORS.grow,
    textColor: '#F8F9FA',
  },
  {
    id: 'gold',
    name: 'Gold Fusion',
    bg: '#25200C',
    border: COLORS.accentGold,
    accent: COLORS.accentGold,
    textColor: '#FFFBF0',
  },
  {
    id: 'midnight',
    name: 'Royal Blue',
    bg: '#0C172E',
    border: '#5393FF',
    accent: '#5393FF',
    textColor: COLORS.text,
  },
];

const SHARE_CHANNELS = [
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: '#25D366' },
  { id: 'instagram', name: 'Insta Story', icon: '📸', color: '#E1306C' },
  { id: 'twitter', name: 'X / Twitter', icon: '🐦', color: '#1DA1F2' },
  { id: 'telegram', name: 'Telegram', icon: '✈️', color: '#0088cc' },
];

export default function ShareTab({ onTriggerConfetti, onRefreshPortfolio }) {
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [userName, setUserName] = useState('Arjun Sharma');
  const [streakCount, setStreakCount] = useState(5);
  const [referralLink, setReferralLink] = useState('blinkmoney.in/ref/arjun5');
  const [questCompleted, setQuestCompleted] = useState(false);
  const [shareSuccessMsg, setShareSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const streakData = await loadStreak();
    if (streakData && streakData.streakCount) {
      setStreakCount(streakData.streakCount);
    }

    const completed = await loadCompletedQuests();
    if (completed.includes('share_card')) {
      setQuestCompleted(true);
    }
  };

  const handleShareOnChannel = async (channel) => {
    try {
      setShareSuccessMsg(`Opening ${channel.name} share page...`);

      setTimeout(async () => {
        setShareSuccessMsg(`Successfully shared on ${channel.name}!`);

        // Complete the quest
        if (!questCompleted) {
          const completed = await loadCompletedQuests();
          if (!completed.includes('share_card')) {
            const updated = [...completed, 'share_card'];
            await saveCompletedQuests(updated);

            // Award 100 XP
            const profile = await loadPortfolio();
            profile.xp = (profile.xp || 0) + 100;
            await savePortfolio(profile);

            setQuestCompleted(true);
            onTriggerConfetti();
            if (onRefreshPortfolio) onRefreshPortfolio();
          }
        }

        // Clear message after a short delay
        setTimeout(() => {
          setShareSuccessMsg('');
        }, 3000);
      }, 800);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Title Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Refer & Go Viral</Text>
        <Text style={styles.subtitle}>Customize your compounding card and invite friends.</Text>
      </View>

      {/* Customize Inputs Card */}
      <View style={styles.inputCard}>
        <Text style={styles.sectionLabel}>Customize Card Details</Text>

        <View style={styles.textInputWrapper}>
          <Text style={styles.textInputLabel}>Your Display Name</Text>
          <TextInput
            style={styles.textInput}
            value={userName}
            onChangeText={setUserName}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <Text style={styles.textInputLabel}>Select Card Theme</Text>
        <View style={styles.themesRow}>
          {THEMES.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              activeOpacity={0.8}
              onPress={() => setActiveTheme(theme)}
              style={[
                styles.themeBtn,
                { backgroundColor: theme.bg, borderColor: activeTheme.id === theme.id ? theme.border : COLORS.cardBorder },
              ]}
            >
              <Text style={[styles.themeBtnText, { color: theme.textColor }]}>
                {theme.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Premium Shareable Card Showcase */}
      <View style={styles.cardShowcaseWrapper}>
        <View style={[styles.shareCard, { backgroundColor: activeTheme.bg, borderColor: activeTheme.border }]}>
          {/* Card branding */}
          <View style={styles.cardHeader}>
            <View style={styles.logoDot} />
            <Text style={styles.cardBranding}>BlinkMoney</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={[styles.cardUser, { color: activeTheme.textColor }]}>{userName}</Text>
            <Text style={styles.cardTagline}>is beating inflation daily</Text>

            {/* Streak Counter display */}
            <View style={[styles.cardStreakBox, { borderColor: `${activeTheme.accent}33`, backgroundColor: 'rgba(0,0,0,0.2)' }]}>
              <Text style={styles.cardStreakText}>🔥 {streakCount} Days Streak</Text>
              <Text style={styles.cardStreakSubtext}>Growing wealth every single day</Text>
            </View>

            {/* Liquid math insight */}
            <Text style={[styles.cardCompoundingDesc, { color: activeTheme.textColor }]}>
              "My money compounds at <Text style={{ color: activeTheme.accent, fontWeight: '800' }}>12% p.a.</Text> but is 100% liquid anytime. Join me!"
            </Text>
          </View>

          {/* QR code and link section */}
          <View style={styles.cardFooter}>
            <View style={styles.footerLeft}>
              <Text style={styles.refLinkTitle}>Scan to start daily SIP at ₹21</Text>
              <Text style={[styles.refLink, { color: activeTheme.accent }]}>{referralLink}</Text>
            </View>

            {/* Styled mockup QR code */}
            <View style={[styles.qrMock, { borderColor: activeTheme.accent }]}>
              <View style={styles.qrRow}>
                <View style={[styles.qrDot, { backgroundColor: activeTheme.accent }]} />
                <View style={[styles.qrDot, { backgroundColor: activeTheme.accent }]} />
                <View style={[styles.qrDot, { backgroundColor: activeTheme.accent }]} />
              </View>
              <View style={styles.qrRow}>
                <View style={[styles.qrDot, { backgroundColor: activeTheme.accent }]} />
                <View style={styles.qrDotInvisible} />
                <View style={[styles.qrDot, { backgroundColor: activeTheme.accent }]} />
              </View>
              <View style={styles.qrRow}>
                <View style={[styles.qrDot, { backgroundColor: activeTheme.accent }]} />
                <View style={[styles.qrDot, { backgroundColor: activeTheme.accent }]} />
                <View style={[styles.qrDot, { backgroundColor: activeTheme.accent }]} />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Share Actions Section */}
      <View style={styles.shareSection}>
        <Text style={styles.sectionLabel}>Invite Friends via</Text>

        <View style={styles.channelsRow}>
          {SHARE_CHANNELS.map((ch) => (
            <TouchableOpacity
              key={ch.id}
              activeOpacity={0.8}
              onPress={() => handleShareOnChannel(ch)}
              style={styles.channelBtn}
            >
              <View style={[styles.channelIconBg, { backgroundColor: `${ch.color}15` }]}>
                <Text style={styles.channelIcon}>{ch.icon}</Text>
              </View>
              <Text style={styles.channelName}>{ch.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {shareSuccessMsg !== '' && (
          <View style={[styles.toastBanner, { borderColor: activeTheme.border }]}>
            <Text style={styles.toastText}>{shareSuccessMsg}</Text>
          </View>
        )}
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
  inputCard: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  textInputWrapper: {
    marginBottom: 12,
  },
  textInputLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '700',
  },
  themesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  themeBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  themeBtnText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardShowcaseWrapper: {
    alignItems: 'center',
    marginVertical: 20,
  },
  shareCard: {
    width: '90%',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  cardBranding: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardBody: {
    marginBottom: 20,
  },
  cardUser: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  cardTagline: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  cardStreakBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 12,
  },
  cardStreakText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  cardStreakSubtext: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
  },
  cardCompoundingDesc: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 14,
  },
  footerLeft: {
    flex: 1,
    marginRight: 10,
  },
  refLinkTitle: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  refLink: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  qrMock: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderRadius: 6,
    padding: 3,
    justifyContent: 'space-around',
    backgroundColor: '#00000033',
  },
  qrRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  qrDot: {
    width: 6,
    height: 6,
    borderRadius: 1,
  },
  qrDotInvisible: {
    width: 6,
    height: 6,
  },
  shareSection: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  channelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  channelBtn: {
    alignItems: 'center',
    width: '22%',
  },
  channelIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  channelIcon: {
    fontSize: 20,
  },
  channelName: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  toastBanner: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  toastText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
});
