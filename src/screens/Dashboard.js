// Mirrors lib/screens/home.dart (DashboardScreen + hero + sub cards).
import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useSubsStore, totalMonthly, monthlyByOtherCurrencies } from '../stores/subs';
import { useCurrencyStore } from '../stores/currency';
import { usePremiumStore, FREE_TIER_LIMIT } from '../stores/premium';
import { useProfileStore, initials } from '../stores/profile';
import { formatCurrency, currencyFromCode } from '../models/currency';
import { CATEGORIES } from '../models/category';
import Icon from '../components/Icon';
import { BRAND, BRAND_TEXT, INK, MUTED, MUTED2, TINT, OTHER_TINT, BORDER, BG, SHADOW, hexA, CARD } from '../components/ui';

// Map each category to a glyph name (see components/Icon.js).
const CATEGORY_ICON = {
  streaming: 'film',
  software: 'laptop',
  fitness: 'gameController',
  other: 'pricetag',
};

// Icon glyphs are warm gray on a light-tint chip (per rebrand spec).
const CHIP_BG = TINT;
const CHIP_FG = MUTED;

function renewalUrgency(days) {
  if (days < 0) return { color: '#C0392B', bg: '#FBEAEA', label: 'Renewal passed' };
  if (days <= 1) return { color: '#854F0B', bg: '#FAEEDA', label: `Renews in ${days} day${days === 1 ? '' : 's'}` };
  if (days <= 3) return { color: '#854F0B', bg: '#FAEEDA', label: `Renews in ${days} days` };
  return { color: '#3B6D11', bg: '#EAF3DE', label: `Renews in ${days} days` };
}

export default function DashboardScreen({ navigation }) {
  const subs = useSubsStore((s) => s.subs);
  const loading = useSubsStore((s) => s.loading);
  const load = useSubsStore((s) => s.load);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const currency = useCurrencyStore((s) => s.currency);
  const profileName = useProfileStore((s) => s.name);

  const defaultTotal = useMemo(() => totalMonthly(subs, currency), [subs, currency]);
  const yearly = defaultTotal * 12;
  const others = useMemo(() => monthlyByOtherCurrencies(subs, currency), [subs, currency]);

  function openAdd() {
    if (!isPremium && subs.length >= FREE_TIER_LIMIT) {
      navigation.navigate('Paywall');
      return;
    }
    navigation.navigate('AddEdit');
  }

  if (loading) {
    return <View style={styles.center}><Text style={{ color: MUTED }}>Loading…</Text></View>;
  }

  if (subs.length === 0) {
    return (
      <View style={styles.center}>
        <EmptyState onAdd={openAdd} />
        <Fab onPress={openAdd} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: 96 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SubTrack</Text>
          <View style={styles.avatar}>
            <Text style={[styles.avatarText, { color: BRAND }]}>{initials(profileName)}</Text>
          </View>
        </View>

        <HeroCard monthly={formatCurrency(defaultTotal, currency)} yearly={formatCurrency(yearly, currency)} count={subs.length} />

        {Object.keys(others).length > 0 && (
          <View style={styles.othersRow}>
            {Object.entries(others).map(([code, val]) => (
              <ChipLabel key={code} code={code} value={formatCurrency(val, currencyFromCode(code))} />
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Upcoming renewals</Text>

        {subs.map((sub) => {
          const days = Math.ceil((new Date(sub.nextRenewalDate).getTime() - Date.now()) / 86400000);
          const u = renewalUrgency(days);
          const cat = CATEGORIES.find((c) => c.name === sub.category?.name) || CATEGORIES[3];
          const cycle = sub.cycle === 'monthly' ? 'mo' : 'yr';
          return (
            <TouchableOpacity
              key={sub.id}
              style={styles.subCard}
              onPress={() => navigation.navigate('AddEdit', { existing: sub })}
            >
              <View style={[styles.catAvatar, { backgroundColor: cat.name === 'other' ? OTHER_TINT : CHIP_BG }]}>
                <Icon name={CATEGORY_ICON[cat.name] || 'pricetag'} size={22} color={CHIP_FG} />
              </View>
              <View style={styles.subMiddle}>
                <Text style={styles.subName}>{sub.name}</Text>
                <View style={[styles.urgencyChip, { backgroundColor: u.bg }]}>
                  <Text style={[styles.urgencyText, { color: u.color }]}>{u.label}</Text>
                </View>
              </View>
              <View style={styles.subRight}>
                <Text style={styles.subPrice}>{formatCurrency(Number(sub.price), sub.currency)}</Text>
                <Text style={styles.subCycle}>/{cycle}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <Fab onPress={openAdd} />
    </View>
  );
}

function Fab({ onPress }) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
      <Icon name="add" size={26} color="#fff" />
    </TouchableOpacity>
  );
}

function ChipLabel({ code, value }) {
  return (
    <View style={[styles.otherChip, { backgroundColor: hexA(BRAND, 0.05) }]}>
      <Text style={[styles.otherChipText, { color: BRAND }]}>{code} {value}/mo</Text>
    </View>
  );
}

function HeroCard({ monthly, yearly, count }) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroTop}>
        <Icon name="sparkles" size={16} color={BRAND_TEXT} />
        <Text style={{ color: BRAND_TEXT, fontSize: 14, marginLeft: 6 }}>Monthly spend</Text>
      </View>
      <Text style={[styles.heroAmount, { color: BRAND_TEXT }]}>{monthly}</Text>
      <View style={styles.heroStats}>
        <View style={styles.heroStat}><Icon name="calendar" size={15} color={BRAND_TEXT} /><Text style={{ color: BRAND_TEXT, fontSize: 13, marginLeft: 6 }}>{yearly} / year</Text></View>
        <View style={styles.heroStat}><Icon name="repeat" size={15} color={BRAND_TEXT} /><Text style={{ color: BRAND_TEXT, fontSize: 13, marginLeft: 6 }}>{count} active</Text></View>
      </View>
    </View>
  );
}

function EmptyState({ onAdd }) {
  return (
    <View style={styles.center}>
      <View style={styles.emptyIcon}>
        <Icon name="wallet" size={44} color={BRAND_TEXT} />
      </View>
      <Text style={styles.emptyTitle}>Track your first subscription</Text>
      <Text style={styles.emptyBody}>See every recurring charge in one place and never get surprised by a renewal again.</Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onAdd}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>+  Add subscription</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  center: { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', padding: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: INK, letterSpacing: -0.4 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: hexA(BRAND, 0.12), alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700', color: BRAND },
  hero: {
    marginHorizontal: 20, marginTop: 8, padding: 22, borderRadius: 24, backgroundColor: BRAND,
    shadowColor: BRAND, shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  heroAmount: { color: '#fff', fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  heroStat: { flexDirection: 'row', alignItems: 'center' },
  othersRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, marginTop: 12 },
  otherChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginRight: 8, marginBottom: 8 },
  otherChipText: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: INK, paddingHorizontal: 20, marginTop: 24, marginBottom: 8 },
  subCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, marginVertical: 6,
    padding: 14, borderRadius: 20, borderWidth: 1, borderColor: BORDER, ...SHADOW,
  },
  catAvatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  subMiddle: { flex: 1, marginLeft: 14 },
  subName: { fontSize: 16, fontWeight: '600', color: INK },
  urgencyChip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  urgencyText: { fontSize: 11.5, fontWeight: '600' },
  subRight: { alignItems: 'flex-end' },
  subPrice: { fontSize: 16, fontWeight: '700', color: INK },
  subCycle: { fontSize: 12, color: MUTED2, marginTop: 4 },
  fab: {
    position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center',
    shadowColor: BRAND, shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  emptyIcon: {
    width: 96, height: 96, borderRadius: 28, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center',
    shadowColor: BRAND, shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8, marginBottom: 24,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: INK, marginBottom: 8, textAlign: 'center' },
  emptyBody: { fontSize: 14, color: MUTED, textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  emptyBtn: { backgroundColor: BRAND, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
});
