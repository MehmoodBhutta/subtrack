// Mirrors lib/screens/onboarding.dart (3-page carousel).
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Icon from '../components/Icon';
import { BRAND, BRAND_TEXT, INK, MUTED, BG } from '../theme';
import { GradientButton } from '../components/ui';

const SLIDES = [
  { icon: 'card', title: 'All your subscriptions in one place', body: 'Track every recurring charge and see exactly where your money goes.' },
  { icon: 'notifications', title: 'Never get surprised by a renewal', body: 'We remind you 2 days before each subscription renews.' },
  { icon: 'barChart', title: 'Understand your spend', body: 'See totals by category and month over month. Free for your first 5.' },
];

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ onDone }) {
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((s, idx) => (
          <View key={idx} style={styles.slide}>
            <View style={styles.iconBox}>
              <Icon name={s.icon} size={56} color={BRAND_TEXT} />
            </View>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((_, d) => (
          <View
            key={d}
            style={[
              styles.dot,
              d === i ? { width: 24, backgroundColor: BRAND } : null,
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <GradientButton
          label={last ? 'Get started' : 'Next'}
          onPress={() => {
            if (last) onDone();
            else setI((v) => v + 1);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, padding: 24 },
  slide: {
    width,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 132,
    height: 132,
    borderRadius: 40,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    shadowColor: BRAND,
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 14,
  },
  body: {
    fontSize: 16,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 28 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(26,27,37,0.12)',
    marginHorizontal: 4,
  },
  footer: { paddingBottom: 8 },
});
