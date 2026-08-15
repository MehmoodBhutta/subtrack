// Mirrors lib/screens/crash_screen.dart — selectable error text for debugging.
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { INK, MUTED } from '../components/ui';

export default function CrashScreen({ error, stack }) {
  const text = `${error ?? 'Unknown error'}\n\n${stack ?? ''}`;
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>SubTrack hit a snag</Text>
      <Text style={styles.hint}>The app ran into an error. Copy the text below and send it back so it can be fixed:</Text>
      <ScrollView style={styles.box}>
        <Text style={styles.mono} selectable>{text}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16, paddingTop: 60 },
  title: { fontSize: 18, fontWeight: '700', color: INK, marginBottom: 12 },
  hint: { fontSize: 14, fontWeight: '600', color: INK, marginBottom: 12 },
  box: { flex: 1, backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 12, padding: 12 },
  mono: { fontSize: 12, fontFamily: 'monospace', color: INK },
});
