// Mirrors lib/screens/add_edit_sub.dart
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { useSubsStore } from '../stores/subs';
import { usePremiumStore, FREE_TIER_LIMIT } from '../stores/premium';
import { useCurrencyStore } from '../stores/currency';
import { CATEGORIES } from '../models/category';
import { CURRENCIES } from '../models/currency';
import { formatDate } from '../utils/format';
import { BRAND, INK, MUTED, BG, hexA } from '../components/ui';
import { PaywallScreen } from './Paywall';

export default function AddEditScreen({ navigation, route }) {
  const existing = route.params?.existing;
  const editing = !!existing;
  const add = useSubsStore((s) => s.add);
  const save = useSubsStore((s) => s.save);
  const remove = useSubsStore((s) => s.remove);
  const subs = useSubsStore((s) => s.subs);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const defaultCurrency = useCurrencyStore((s) => s.currency);

  const [name, setName] = useState(existing?.name || '');
  const [price, setPrice] = useState(existing ? String(existing.price) : '');
  const [cycle, setCycle] = useState(existing?.cycle || 'monthly');
  const [category, setCategory] = useState(existing?.category || CATEGORIES[3]);
  const [currency, setCurrency] = useState(existing?.currency || defaultCurrency);
  const [renewal, setRenewal] = useState(
    existing?.nextRenewalDate || new Date(Date.now() + 30 * 86400000).toISOString()
  );

  // Simple date picker via native prompt-less manual entry: use 3 number inputs.
  // For a polished picker we'd use @react-native-community/datetimepicker;
  // keep manual yyyy-mm-dd to avoid another dependency.
  const [dateText, setDateText] = useState(formatDate(renewal));

  useEffect(() => {
    navigation.setOptions({ title: editing ? 'Edit subscription' : 'New subscription' });
  }, [editing]);

  async function onSave() {
    if (!name.trim()) { Alert.alert('Enter a name'); return; }
    const p = parseFloat(price);
    if (!p || p <= 0) { Alert.alert('Enter a valid price'); return; }

    if (!editing) {
      if (!isPremium && subs.length >= FREE_TIER_LIMIT) {
        navigation.navigate('Paywall');
        return;
      }
      await add({ name: name.trim(), price: p, cycle, nextRenewalDate: renewal, category, currency });
    } else {
      await save({ ...existing, name: name.trim(), price: p, cycle, nextRenewalDate: renewal, category, currency });
    }
    navigation.pop();
  }

  function onDelete() {
    Alert.alert('Delete subscription?', `Remove ${existing.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await remove(existing.id); navigation.pop(); } },
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
      <Field label="Name">
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Netflix" placeholderTextColor={MUTED} />
      </Field>
      <Field label="Price">
        <View style={styles.priceWrap}>
          <Text style={styles.prefix}>{currency.symbol}</Text>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={MUTED}
          />
        </View>
      </Field>

      <Field label="Currency">
        <View style={styles.row}>
          {CURRENCIES.map((c) => (
            <Chip key={c.code} active={c.code === currency.code} label={`${c.code}`} onPress={() => setCurrency(c)} />
          ))}
        </View>
      </Field>

      <Field label="Billing cycle">
        <View style={styles.row}>
          <Chip active={cycle === 'monthly'} label="Monthly" onPress={() => setCycle('monthly')} />
          <Chip active={cycle === 'yearly'} label="Yearly" onPress={() => setCycle('yearly')} />
        </View>
      </Field>

      <Field label="Category">
        <View style={styles.row}>
          {CATEGORIES.map((c) => (
            <Chip key={c.name} active={category.name === c.name} label={c.label} color={c.color} onPress={() => setCategory(c)} />
          ))}
        </View>
      </Field>

      <Field label="Next renewal (MM/DD/YYYY)">
        <TextInput
          style={styles.input}
          value={dateText}
          onChangeText={(t) => {
            setDateText(t);
            const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (m) {
              const d = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
              if (!isNaN(d)) setRenewal(d.toISOString());
            }
          }}
          placeholder="MM/DD/YYYY"
          placeholderTextColor={MUTED}
        />
      </Field>

      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Save</Text>
      </TouchableOpacity>

      {editing && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Text style={{ color: '#EF4444', fontWeight: '600' }}>Delete subscription</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function Field({ label, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Chip({ label, active, color = BRAND, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        active ? { backgroundColor: color } : { backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
      ]}
    >
      <Text style={[styles.chipText, active ? { color: '#fff' } : { color: INK }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: INK, marginBottom: 6, marginLeft: 2 },
  input: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: INK, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  priceWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', paddingLeft: 16 },
  prefix: { fontSize: 15, color: MUTED, marginRight: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginRight: 8, marginBottom: 8 },
  chipText: { fontSize: 14, fontWeight: '600' },
  saveBtn: { backgroundColor: BRAND, borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  deleteBtn: { marginTop: 16, alignItems: 'center', paddingVertical: 12 },
});
