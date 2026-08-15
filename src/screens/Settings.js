// Mirrors lib/screens/settings.dart
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from '../components/Icon';
import { usePremiumStore } from '../stores/premium';
import { useCurrencyStore } from '../stores/currency';
import { useSubsStore } from '../stores/subs';
import { useProfileStore, initials } from '../stores/profile';
import { CURRENCIES } from '../models/currency';
import * as notes from '../services/notifications';
import { BRAND, INK, MUTED, MUTED2, TINT, BORDER, BG, SHADOW, hexA } from '../components/ui';

export default function SettingsScreen({ navigation }) {
  const isPremium = usePremiumStore((s) => s.isPremium);
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.set);
  const clearAll = useSubsStore((s) => s.clearAll);
  const profileName = useProfileStore((s) => s.name);
  const setProfileName = useProfileStore((s) => s.setName);

  function editName() {
    Alert.prompt(
      'Your name',
      'Shown on your profile (stored only on this device).',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', onPress: (text) => setProfileName(text || '') },
      ],
      'plain-text',
      profileName
    );
  }

  function onDeleteAll() {
    Alert.alert('Delete all data?', 'This permanently removes all subscriptions on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete all', style: 'destructive', onPress: clearAll },
    ]);
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.h1}>Settings</Text>
      <View style={{ paddingHorizontal: 20 }}>

        <SectionCard title="Profile">
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={editName}>
            <View style={[styles.iconBox, { backgroundColor: TINT }]}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: BRAND }}>{initials(profileName)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.rowTitle}>{profileName ? profileName : 'Tap to set your name'}</Text>
              <Text style={styles.rowSub}>Local profile — stored only on this device.</Text>
            </View>
            <Icon name="chevronForward" size={20} color={MUTED} />
          </TouchableOpacity>
        </SectionCard>

        <SectionCard title="Plan">
          <Row>
            <View style={[styles.iconBox, { backgroundColor: isPremium ? BRAND : TINT }]}>
              <Icon name="diamond" size={20} color={isPremium ? '#fff' : MUTED} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Plan</Text>
              <Text style={styles.rowSub}>{isPremium ? 'SubTrack Premium' : 'Free plan'}</Text>
            </View>
            {isPremium ? (
              <Text style={{ color: BRAND, fontSize: 22 }}>✓</Text>
            ) : (
              <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Paywall')}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Upgrade</Text>
              </TouchableOpacity>
            )}
          </Row>
        </SectionCard>

        <SectionCard title="Preferences">
          <Row>
            <Icon name="swapHorizontal" size={20} color={MUTED} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Default currency</Text>
              <Text style={styles.rowSub}>Dashboard and new subs use this.</Text>
            </View>
            <View style={styles.picker}>
              {CURRENCIES.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  onPress={() => setCurrency(c)}
                  style={[styles.curPill, currency.code === c.code && styles.curPillActive]}
                >
                  <Text style={[styles.curText, currency.code === c.code && styles.curTextActive]}>{c.code}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Row>
          <Divider />
          <Row onPress={() => notes.requestPermission()}>
            <Icon name="notifications" size={20} color={MUTED} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Renewal reminders</Text>
              <Text style={styles.rowSub}>Remind me 2 days before each renewal.</Text>
            </View>
            <Text style={{ color: MUTED, fontSize: 20 }}>›</Text>
          </Row>
        </SectionCard>

        <SectionCard title="Data">
          <Row onPress={onDeleteAll}>
            <Icon name="trash" size={20} color="#EF4444" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: '#EF4444' }]}>Delete all data</Text>
              <Text style={styles.rowSub}>Removes every subscription & reminder.</Text>
            </View>
            <Text style={{ color: MUTED, fontSize: 20 }}>›</Text>
          </Row>
        </SectionCard>

        <Text style={[styles.rowSub, { textAlign: 'center', marginTop: 24 }]}>SubTrack v1.0.0</Text>
      </View>
    </View>
  );
}

function SectionCard({ title, children }) {
  return (
    <View style={{ marginTop: 14 }}>
      {title && <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>}
      <View style={[styles.card, SHADOW]}>{children}</View>
    </View>
  );
}

function Row({ children, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
      {children}
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: BORDER, marginVertical: 4 }} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  h1: { fontSize: 22, fontWeight: '800', color: INK, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, color: MUTED, marginLeft: 4, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: INK },
  rowSub: { fontSize: 12, color: MUTED, marginTop: 2 },
  upgradeBtn: { backgroundColor: BRAND, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  picker: { flexDirection: 'row', flexWrap: 'wrap', maxWidth: 150, justifyContent: 'flex-end' },
  curPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginLeft: 4, marginBottom: 4, backgroundColor: TINT, borderWidth: 1, borderColor: BORDER },
  curPillActive: { backgroundColor: BRAND, borderColor: BRAND },
  curText: { fontSize: 12, color: INK },
  curTextActive: { color: '#fff', fontWeight: '600' },
});
