// Shared building blocks used across screens. Reproduces the Flutter card,
// chip and gradient-hero surfaces from lib/theme.dart + lib/screens/*.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BRAND, BRAND_GRADIENT, INK, MUTED, RADIUS, SHADOW, BG } from '../theme';

export function Card({ style, children }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Chip({ label, color = BRAND }) {
  return (
    <View style={[styles.chip, { backgroundColor: hexA(color, 0.12) }]}>
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

export function GradientButton({ label, onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.gradientBtn, style]}>
      <View style={styles.gradientInner}>
        <Text style={styles.gradientBtnText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function OutlinedButton({ label, onPress, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.outlinedBtn, style]}
    >
      <Text style={styles.outlinedBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// Hex with alpha (0..1) -> rgba string.
export function hexA(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS,
    ...SHADOW,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  gradientBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: BRAND,
  },
  gradientInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    // simple brand fill (gradient via linear-gradient not trivial in RN; keep solid brand)
  },
  gradientBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  outlinedBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlinedBtnText: {
    color: INK,
    fontSize: 15,
    fontWeight: '600',
  },
});

// Re-export theme constants so screens can import them from here alongside the
// shared UI components. Without this, `import { BRAND } from '../components/ui'`
// resolves to undefined and `hexA(undefined)` crashes at StyleSheet.create time.
export { BRAND, BRAND_TEXT, OTHER_TINT, INK, MUTED, MUTED2, TINT, BORDER, RADIUS, SHADOW, BG, CARD } from '../theme';

