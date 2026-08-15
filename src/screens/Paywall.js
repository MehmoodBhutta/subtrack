// Mirrors lib/screens/paywall.dart
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { usePremiumStore } from '../stores/premium';
import Icon from '../components/Icon';
import { GradientButton, OutlinedButton } from '../components/ui';
import { BRAND, BRAND_TEXT, INK, MUTED, BG } from '../components/ui';

const BENEFITS = [
  'Unlimited subscriptions to track',
  'Renewal push reminders',
  'Spend insights by category & month',
];

export default function PaywallScreen({ navigation }) {
  const isPremium = usePremiumStore((s) => s.isPremium);
  const purchase = usePremiumStore((s) => s.purchase);
  const restore = usePremiumStore((s) => s.restore);

  async function onUpgrade() {
    await purchase();
    navigation?.pop();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.inner}>
        <View style={styles.badge}>
          <Icon name="diamond" size={40} color={BRAND_TEXT} />
        </View>
        <Text style={styles.title}>Unlock everything</Text>
        <Text style={styles.subtitle}>Take full control of your subscriptions.</Text>

        {BENEFITS.map((b, i) => (
          <View key={i} style={styles.benefit}>
            <Text style={{ color: BRAND, fontSize: 18 }}>✓</Text>
            <Text style={styles.benefitText}>{b}</Text>
          </View>
        ))}

        {isPremium ? (
          <View style={styles.premiumBadge}>
            <Text style={{ color: '#10B981', fontWeight: '600' }}>✓ You are on Premium. Enjoy!</Text>
          </View>
        ) : (
          <>
            <GradientButton label="Upgrade — $2.99/mo" onPress={onUpgrade} />
            <View style={{ height: 12 }} />
            <OutlinedButton label="Restore purchase" onPress={restore} />
          </>
        )}

        <View style={{ height: 12 }} />
        <Text style={styles.notNow} onPress={() => navigation?.pop()}>Not now</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  inner: { flex: 1, padding: 24 },
  badge: { width: 84, height: 84, borderRadius: 26, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 16, shadowColor: BRAND, shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
  title: { fontSize: 26, fontWeight: '800', color: INK, textAlign: 'center', marginTop: 20 },
  subtitle: { fontSize: 15, color: MUTED, textAlign: 'center', marginTop: 8, marginBottom: 28 },
  benefit: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginVertical: 7, ...({ shadowColor: '#1A1B25', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 }) },
  benefitText: { fontSize: 15, color: INK, fontWeight: '500', marginLeft: 12, flex: 1 },
  premiumBadge: { backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 16, padding: 16, alignItems: 'center' },
  notNow: { color: MUTED, textAlign: 'center', fontSize: 14 },
});
