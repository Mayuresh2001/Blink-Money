import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../theme/colors';
import {
  loadPortfolio,
  savePortfolio,
  loadCompletedQuests,
  saveCompletedQuests,
} from '../utils/storage';

export default function PortfolioTab({ onTriggerConfetti, refreshTrigger }) {
  const [portfolio, setPortfolio] = useState({
    balance: 24500,
    stocksAmount: 15960,
    fdAmount: 3552,
    goldAmount: 2143,
    borrowedAmount: 0,
    xp: 0,
  });

  const [saveAmountInput, setSaveAmountInput] = useState('50');
  const [borrowAmountInput, setBorrowAmountInput] = useState('5000');
  const [saveStatus, setSaveStatus] = useState({ state: 'idle', msg: '' });
  const [borrowStatus, setBorrowStatus] = useState({ state: 'idle', msg: '' });

  useEffect(() => {
    fetchPortfolio();
  }, [refreshTrigger]);

  const fetchPortfolio = async () => {
    const loaded = await loadPortfolio();
    setPortfolio(loaded);
  };

  const handleQuickSave = async (amountVal) => {
    const amount = parseFloat(amountVal);
    if (isNaN(amount) || amount <= 0) return;

    setSaveStatus({ state: 'loading', msg: 'Allocating assets dynamically...' });

    setTimeout(async () => {
      try {
        const current = await loadPortfolio();

        const addStocks = amount * 0.6514;
        const addFD = amount * 0.1450;
        const addGold = amount * 0.0875;

        const updated = {
          ...current,
          balance: current.balance + amount,
          stocksAmount: current.stocksAmount + addStocks,
          fdAmount: current.fdAmount + addFD,
          goldAmount: current.goldAmount + addGold,
          xp: current.xp + 20,
        };
        if (amount >= 21) {
          const completed = await loadCompletedQuests();
          if (!completed.includes('first_deposit')) {
            const updatedQuests = [...completed, 'first_deposit'];
            await saveCompletedQuests(updatedQuests);
            updated.xp += 80;
          }
        }

        await savePortfolio(updated);
        setPortfolio(updated);
        setSaveStatus({ state: 'success', msg: `Successfully deposited ₹${amount}!` });
        onTriggerConfetti();
        setTimeout(() => {
          setSaveStatus({ state: 'idle', msg: '' });
        }, 2000);
      } catch (e) {
        console.error(e);
        setSaveStatus({ state: 'idle', msg: '' });
      }
    }, 1200);
  };

  const handleQuickBorrow = async () => {
    const amount = parseFloat(borrowAmountInput);
    if (isNaN(amount) || amount <= 0) return;

    const creditLimit = Math.max(0, portfolio.balance * 0.9 - portfolio.borrowedAmount);

    if (amount > creditLimit) {
      setBorrowStatus({
        state: 'error',
        msg: `Limit Exceeded. Max credit limit available is ₹${Math.round(creditLimit).toLocaleString()}`,
      });
      return;
    }

    setBorrowStatus({ state: 'loading', msg: 'Verifying portfolio collateral...' });

    setTimeout(async () => {
      try {
        const current = await loadPortfolio();
        const updated = {
          ...current,
          borrowedAmount: current.borrowedAmount + amount,
          xp: current.xp + 30,
        };

        await savePortfolio(updated);
        setPortfolio(updated);
        setBorrowStatus({
          state: 'success',
          msg: `Disbursed ₹${amount.toLocaleString()} to SBI A/c *8823! Your assets are STILL compounding at 12% p.a.!`,
        });
        onTriggerConfetti();

        setTimeout(() => {
          setBorrowStatus({ state: 'idle', msg: '' });
        }, 4000);
      } catch (e) {
        console.error(e);
        setBorrowStatus({ state: 'idle', msg: '' });
      }
    }, 1500);
  };

  const handleRepayLoan = async () => {
    if (portfolio.borrowedAmount <= 0) return;

    setBorrowStatus({ state: 'loading', msg: 'Processing repayment...' });

    setTimeout(async () => {
      try {
        const current = await loadPortfolio();
        const repayAmount = current.borrowedAmount;
        const updated = {
          ...current,
          balance: Math.max(0, current.balance - repayAmount),
          stocksAmount: Math.max(0, current.stocksAmount - repayAmount * 0.65),
          borrowedAmount: 0,
          xp: current.xp + 40,
        };

        await savePortfolio(updated);
        setPortfolio(updated);
        setBorrowStatus({ state: 'success', msg: `Loan of ₹${Math.round(repayAmount).toLocaleString()} Repaid Successfully!` });
        onTriggerConfetti();

        setTimeout(() => {
          setBorrowStatus({ state: 'idle', msg: '' });
        }, 2000);
      } catch (e) {
        console.error(e);
        setBorrowStatus({ state: 'idle', msg: '' });
      }
    }, 1200);
  };

  const creditLimit = Math.max(0, portfolio.balance * 0.9 - portfolio.borrowedAmount);
  const userLevel = Math.floor(portfolio.xp / 100) + 1;
  const levelProgress = (portfolio.xp % 100) / 100;

  const formatCurrency = (val) => {
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>My Portfolio</Text>
        <Text style={styles.subtitle}>Liquid wealth statistics and instant credit line.</Text>
      </View>
      <View style={styles.wealthCard}>
        <View style={styles.levelRow}>
          <Text style={styles.levelBadge}>Level {userLevel} Saver</Text>
          <Text style={styles.xpText}>{portfolio.xp % 100} / 100 XP</Text>
        </View>
        <View style={styles.xpBarContainer}>
          <View style={[styles.xpBarFill, { width: `${levelProgress * 100}%` }]} />
        </View>

        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Liquid Wealth Value</Text>
          <Text style={styles.balanceValue}>{formatCurrency(portfolio.balance)}</Text>
          <Text style={styles.growBadge}>✦ Compounding @ ~12% p.a.</Text>
        </View>

        <View style={styles.creditRow}>
          <View style={styles.creditItem}>
            <Text style={styles.creditLabel}>Available Credit</Text>
            <Text style={[styles.creditVal, { color: COLORS.primary }]}>
              {formatCurrency(creditLimit)}
            </Text>
          </View>
          <View style={styles.creditDivider} />
          <View style={styles.creditItem}>
            <Text style={styles.creditLabel}>Active Borrowing</Text>
            <Text style={[styles.creditVal, { color: portfolio.borrowedAmount > 0 ? COLORS.borrow : COLORS.textMuted }]}>
              {formatCurrency(portfolio.borrowedAmount)}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Asset Allocation</Text>
        <View style={styles.allocationBar}>
          <View style={[styles.allocSegment, { flex: 65, backgroundColor: COLORS.save }]} />
          <View style={[styles.allocSegment, { flex: 15, backgroundColor: COLORS.grow }]} />
          <View style={[styles.allocSegment, { flex: 9, backgroundColor: COLORS.accentGold }]} />
          <View style={[styles.allocSegment, { flex: 11, backgroundColor: COLORS.textMuted }]} />
        </View>
        <View style={styles.allocDetailsGrid}>
          <View style={styles.allocItem}>
            <View style={[styles.allocIndicator, { backgroundColor: COLORS.save }]} />
            <View>
              <Text style={styles.allocName}>Mutual Funds (65%)</Text>
              <Text style={styles.allocVal}>{formatCurrency(portfolio.stocksAmount)}</Text>
            </View>
          </View>
          <View style={styles.allocItem}>
            <View style={[styles.allocIndicator, { backgroundColor: COLORS.grow }]} />
            <View>
              <Text style={styles.allocName}>Liquid FDs (15%)</Text>
              <Text style={styles.allocVal}>{formatCurrency(portfolio.fdAmount)}</Text>
            </View>
          </View>
          <View style={styles.allocItem}>
            <View style={[styles.allocIndicator, { backgroundColor: COLORS.accentGold }]} />
            <View>
              <Text style={styles.allocName}>Digital Gold (9%)</Text>
              <Text style={styles.allocVal}>{formatCurrency(portfolio.goldAmount)}</Text>
            </View>
          </View>
          <View style={styles.allocItem}>
            <View style={[styles.allocIndicator, { backgroundColor: COLORS.textMuted }]} />
            <View>
              <Text style={styles.allocName}>Cash Reserves (11%)</Text>
              <Text style={styles.allocVal}>
                {formatCurrency(portfolio.balance - (portfolio.stocksAmount + portfolio.fdAmount + portfolio.goldAmount))}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Auto-Save</Text>
        <Text style={styles.cardSubtitle}>Invest spare capital instantly and keep growing.</Text>

        {saveStatus.state === 'loading' ? (
          <View style={styles.centerStatus}>
            <ActivityIndicator color={COLORS.primary} size="small" />
            <Text style={styles.statusLabel}>{saveStatus.msg}</Text>
          </View>
        ) : saveStatus.state === 'success' ? (
          <View style={styles.successStatus}>
            <Text style={styles.successIcon}>🎉</Text>
            <Text style={styles.successText}>{saveStatus.msg}</Text>
          </View>
        ) : (
          <View>
            <View style={styles.quickSaveRow}>
              {[21, 50, 100].map((amt) => (
                <TouchableOpacity
                  key={`qs-${amt}`}
                  activeOpacity={0.7}
                  onPress={() => handleQuickSave(amt)}
                  style={styles.quickSaveButton}
                >
                  <Text style={styles.quickSaveButtonText}>+ ₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customInputRow}>
              <TextInput
                style={styles.customInput}
                value={saveAmountInput}
                onChangeText={setSaveAmountInput}
                keyboardType="numeric"
                placeholder="Custom Amount"
                placeholderTextColor={COLORS.textMuted}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleQuickSave(saveAmountInput)}
                style={styles.customInputBtn}
              >
                <Text style={styles.customInputBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Instant Liquid Loan</Text>
        <Text style={styles.cardSubtitle}>Draw cash against your portfolio at 9.99% p.a.</Text>

        {borrowStatus.state === 'loading' ? (
          <View style={styles.centerStatus}>
            <ActivityIndicator color={COLORS.primary} size="small" />
            <Text style={styles.statusLabel}>{borrowStatus.msg}</Text>
          </View>
        ) : borrowStatus.state === 'success' ? (
          <View style={styles.successStatus}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successText}>{borrowStatus.msg}</Text>
          </View>
        ) : (
          <View>
            <View style={styles.customInputRow}>
              <TextInput
                style={styles.customInput}
                value={borrowAmountInput}
                onChangeText={setBorrowAmountInput}
                keyboardType="numeric"
                placeholder="Amount to Borrow"
                placeholderTextColor={COLORS.textMuted}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleQuickBorrow}
                style={[styles.customInputBtn, { backgroundColor: COLORS.borrow }]}
              >
                <Text style={[styles.customInputBtnText, { color: COLORS.white }]}>Borrow</Text>
              </TouchableOpacity>
            </View>

            {borrowStatus.state === 'error' && (
              <Text style={styles.errorText}>{borrowStatus.msg}</Text>
            )}
            {portfolio.borrowedAmount > 0 && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleRepayLoan}
                style={styles.repayButton}
              >
                <Text style={styles.repayButtonText}>
                  Repay Full Loan ({formatCurrency(portfolio.borrowedAmount)})
                </Text>
              </TouchableOpacity>
            )}
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
  wealthCard: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelBadge: {
    backgroundColor: COLORS.accentGoldBg,
    borderColor: COLORS.accentGold,
    borderWidth: 0.8,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.accentGold,
  },
  xpText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  xpBarContainer: {
    height: 4,
    backgroundColor: COLORS.cardBorder,
    borderRadius: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.accentGold,
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
    marginVertical: 4,
  },
  growBadge: {
    fontSize: 10,
    color: COLORS.save,
    fontWeight: '700',
  },
  creditRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 14,
  },
  creditItem: {
    flex: 1,
    alignItems: 'center',
  },
  creditDivider: {
    width: 1,
    backgroundColor: COLORS.cardBorder,
    height: '80%',
    alignSelf: 'center',
  },
  creditLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  creditVal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '850',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  allocationBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    marginVertical: 12,
  },
  allocSegment: {
    height: '100%',
  },
  allocDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  allocItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  allocIndicator: {
    width: 6,
    height: 18,
    borderRadius: 3,
    marginRight: 8,
  },
  allocName: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  allocVal: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '800',
    marginTop: 1,
  },
  quickSaveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickSaveButton: {
    flex: 1,
    backgroundColor: COLORS.saveBg,
    borderColor: COLORS.save,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  quickSaveButtonText: {
    color: COLORS.save,
    fontSize: 12,
    fontWeight: '800',
  },
  customInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    marginRight: 8,
  },
  customInputBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customInputBtnText: {
    color: COLORS.primaryContrast,
    fontSize: 12,
    fontWeight: '800',
  },
  centerStatus: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontWeight: '600',
  },
  successStatus: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(46, 193, 111, 0.08)',
    borderColor: 'rgba(46, 193, 111, 0.2)',
    borderWidth: 1,
    borderRadius: 10,
  },
  successIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  successText: {
    color: COLORS.save,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 14,
  },
  errorText: {
    color: COLORS.borrow,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
  },
  repayButton: {
    backgroundColor: 'rgba(255, 95, 95, 0.08)',
    borderColor: COLORS.borrow,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  repayButtonText: {
    color: COLORS.borrow,
    fontSize: 12,
    fontWeight: '800',
  },
});
